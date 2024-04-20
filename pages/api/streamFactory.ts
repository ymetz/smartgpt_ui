import {Message} from "@/types/chat";
import {BaseModel} from "@/types/BaseModel";

import {Providers} from "@/types/providers";
import {
    ANTHROPIC_API_HOST,
    AZURE_DEPLOYMENT_ID,
    GROQ_API_HOST,
    OPENAI_API_HOST,
    OPENAI_API_TYPE,
    OPENAI_API_VERSION,
    OPENAI_ORGANIZATION
} from "@/utils/app/const";
import {createParser, ParsedEvent, ReconnectInterval} from "eventsource-parser";

const UNKNOWN_MODEL_ERROR = "Error: Unknown Model ";

export async function getStream(
    model: BaseModel,
    prompt: string,
    temperatureToUse: number,
    apiKeys: Record<Providers, string>,
    messages: Message[]
): Promise<ReadableStream> {
    const provider = getProviderFor(model);
    const modelSpecificStream = getStreamProvider(provider);
    const apiKey = apiKeys[provider];
    return modelSpecificStream(model, prompt, temperatureToUse, apiKey, messages, provider);
}

function getProviderFor(model: BaseModel): Providers {
    const providersMapping: Record<string, Providers> = {
        'gpt': Providers.OPENAI,
        'claude': Providers.ANTHROPIC,
        'Groq': Providers.GROQ,
    };
    const provider = Object.keys(providersMapping).find(
        (key) => model.id.includes(key) || model.name.includes(key)
    );
    if (provider) {
        return providersMapping[provider];
    } else {
        throw new Error(UNKNOWN_MODEL_ERROR + model.name);
    }
}

export function getStreamProvider(provider: Providers) {
    switch (provider) {
        case Providers.OPENAI:
            return createOpenAIStream;
        case Providers.ANTHROPIC:
            return createAnthropicStream;
        case Providers.GROQ:
            return createGroqStream;
        default:
            throw new Error('Invalid model provider');
    }
}

function createOpenAIStream(
    model: BaseModel,
    systemPrompt: string,
    temperature: number,
    apiKey: string,
    messages: Message[],
    provider: Providers
): Promise<ReadableStream> {
    const url =
        OPENAI_API_TYPE === "azure"
            ? `${OPENAI_API_HOST}/openai/deployments/${AZURE_DEPLOYMENT_ID}/chat/completions?api-version=${OPENAI_API_VERSION}`
            : `${OPENAI_API_HOST}/v1/chat/completions`;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(OPENAI_API_TYPE === "openai" && {
            Authorization: `Bearer ${apiKey || process.env.OPENAI_API_KEY}`,
        }),
        ...(OPENAI_API_TYPE === "azure" && {
            "api-key": `${apiKey || process.env.OPENAI_API_KEY}`,
        }),
        ...((OPENAI_API_TYPE === "openai" && OPENAI_ORGANIZATION) && {
            "OpenAI-Organization": OPENAI_ORGANIZATION,
        }),
    };

    const body = JSON.stringify({
        ...(OPENAI_API_TYPE === "openai" && {model: model.id}),
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            ...messages,
        ],
        max_tokens: model?.tokenLimit || 1000,
        temperature,
        stream: true,
    });

    return createStream(url, headers, body, provider);
}

function createAnthropicStream(
    model: BaseModel,
    systemPrompt: string,
    temperature: number,
    apiKey: string,
    messages: Message[],
    provider: Providers
): Promise<ReadableStream> {
    const url = `${ANTHROPIC_API_HOST}/v1/messages`;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "messages-2023-12-15",
        "X-API-Key": `${apiKey || process.env.ANTHROPIC_API_KEY}`,
    };

    const body = JSON.stringify({
        model: model.id,
        messages: [...messages],
        system: systemPrompt,
        max_tokens: model?.tokenLimit || 1000,
        temperature,
        stream: true,
    });

    return createStream(url, headers, body, provider);
}

function createGroqStream(
    model: BaseModel,
    systemPrompt: string,
    temperature: number,
    apiKey: string,
    messages: Message[],
    provider: Providers
): Promise<ReadableStream> {
    const url = `${GROQ_API_HOST}/v1/chat/completions`;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey || process.env.GROQ_API_KEY}`,
    };

    const body = JSON.stringify({
        model: model.id,
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            ...messages,
        ],
        max_tokens: model?.tokenLimit || 1000,
        temperature,
        stream: true,
    });

    return createStream(url, headers, body, provider);
}

async function createStream(
    url: string,
    headers: HeadersInit,
    body: string,
    provider: Providers,
    prependString?: string
): Promise<ReadableStream> {
    const res = await fetch(url, {
        headers,
        method: "POST",
        body,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    if (res.status !== 200) {
        const result = await res.json();
        throw new Error(
            `API returned an error: ${decoder.decode(result?.value) || result.statusText}`
        );
    }

    function handleAnthropicContentBlock(event: ParsedEvent, controller: ReadableStreamDefaultController<any>, data: string) {
        try {
            if (event.event === 'message_stop') {
                controller.close();
                return;
            }
            if (event.event === 'content_block_delta') {
                const text = JSON.parse(data).delta.text;
                const queue = encoder.encode(text);
                controller.enqueue(queue);
            }
        } catch (e) {
            controller.error(e);
        }
    }

    function handleOpenaiContentBlock(data: string, controller: ReadableStreamDefaultController<any>) {
        if (data === "[DONE]") {
            controller.close();
            return;
        } else {
            try {
                const json = JSON.parse(data);
                const text = json.choices[0]?.delta?.content || "";
                const queue = encoder.encode(text);
                controller.enqueue(queue);
            } catch (e) {
                controller.error(e);
            }
        }
    }

    return new ReadableStream({
        async start(controller) {
            const onParse = (event: ParsedEvent | ReconnectInterval) => {
                if (event.type === "event") {
                    const data = event.data;

                    if (provider == Providers.ANTHROPIC) {
                        handleAnthropicContentBlock(event, controller, data);
                    } else if  (provider == Providers.OPENAI || Providers.GROQ) {
                        handleOpenaiContentBlock(data, controller);
                    }
                }
            };

            const parser = createParser(onParse);

            if (prependString) {
                const queue = encoder.encode(prependString);
                controller.enqueue(queue);
            }

            for await (const chunk of res.body as any) {
                parser.feed(decoder.decode(chunk));
            }
        },
    });
}