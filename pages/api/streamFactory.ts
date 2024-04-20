import {Message} from "@/types/chat";
import {
    ANTHROPIC_API_HOST,
    AZURE_DEPLOYMENT_ID,
    GROQ_API_HOST,
    OPENAI_API_HOST,
    OPENAI_API_TYPE,
    OPENAI_API_VERSION,
    OPENAI_ORGANIZATION,
} from "@/utils/app/const";
import {createParser, ParsedEvent, ReconnectInterval} from "eventsource-parser";
import {BaseModel} from "@/types/BaseModel";

type ModelProvider = (
    model: BaseModel,
    prompt: string,
    temperatureToUse: number,
    apiKey: string,
    messages: Message[]
) => Promise<ReadableStream>;

const modelProviders: Record<string, ModelProvider> = {
    gpt: createOpenAIStream,
    claude: createAnthropicStream,
    "@Groq": createGroqStream,
};

export async function getStream(
    model: BaseModel,
    prompt: string,
    temperatureToUse: number,
    apiKeys: Record<string, string>,
    messages: Message[]
): Promise<ReadableStream> {
    const provider = Object.keys(modelProviders).find(
        (key) => model.id.includes(key) || model.name.includes(key)
    );

    if (!provider) {
        throw new Error("Error: Unknown Model");
    }

    const createStream = modelProviders[provider];
    const apiKey = apiKeys[provider];
    return createStream(model, prompt, temperatureToUse, apiKey, messages);
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
        ...(OPENAI_API_TYPE === "openai" && { model: model.id }),
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
