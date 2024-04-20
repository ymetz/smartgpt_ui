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
    const provider = Object.values(Providers).find(
        (value) => model.id.includes(value) || model.name.includes(value)
    );
    if (!provider) {
        throw new Error(UNKNOWN_MODEL_ERROR + model.name);
    }
    const modelSpecificStream = getStreamProvider(provider);
    const apiKey = apiKeys[provider];
    return modelSpecificStream(model, prompt, temperatureToUse, apiKey, messages);
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
    messages: Message[]
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

    return createStream(url, headers, body);
}

function createAnthropicStream(
    model: BaseModel,
    systemPrompt: string,
    temperature: number,
    apiKey: string,
    messages: Message[]
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
        messages,
        system: systemPrompt,
        max_tokens: model?.tokenLimit || 1000,
        temperature,
        stream: true,
    });

    return createStream(url, headers, body);
}

function createGroqStream(
    model: BaseModel,
    systemPrompt: string,
    temperature: number,
    apiKey: string,
    messages: Message[]
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

    return createStream(url, headers, body);
}

async function createStream(
    url: string,
    headers: HeadersInit,
    body: string,
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

    return new ReadableStream({
        async start(controller) {
            const onParse = (event: ParsedEvent | ReconnectInterval) => {
                if (event.type === "event") {
                    const data = event.data;
                    if (data === "[DONE]") {
                        controller.close();
                        return;
                    }
                    try {
                        const json = JSON.parse(data);
                        const text = json.choices[0]?.delta?.content || "";
                        const queue = encoder.encode(text);
                        controller.enqueue(queue);
                    } catch (e) {
                        controller.error(e);
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