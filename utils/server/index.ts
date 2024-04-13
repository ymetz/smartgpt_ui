import { Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';

import { AZURE_DEPLOYMENT_ID, OPENAI_API_HOST, OPENAI_API_TYPE, OPENAI_API_VERSION, OPENAI_ORGANIZATION } from '../app/const';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { AnthropicModel } from '@/types/anthropic';

export class OpenAIError extends Error {
  type: string;
  code: string;

  constructor(message: string, type: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.code = code;
  }
}

export class AnthropicError extends Error {
  type: string;
  code: string;

  constructor(message: string, type: string, code: string) {
    super(message);
    this.name = 'AnthropicError';
    this.type = type;
    this.code = code;
  }
}

export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  temperature : number,
  key: string,
  messages: Message[],
  prependString?: string,
) => {
  let url = `${OPENAI_API_HOST}/v1/chat/completions`;
  if (OPENAI_API_TYPE === 'azure') {
    url = `${OPENAI_API_HOST}/openai/deployments/${AZURE_DEPLOYMENT_ID}/chat/completions?api-version=${OPENAI_API_VERSION}`;
  }

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(OPENAI_API_TYPE === 'openai' && {
        Authorization: `Bearer ${key}`
      }),
      ...(OPENAI_API_TYPE === 'azure' && {
        'api-key': `${key}`
      }),
      ...((OPENAI_API_TYPE === 'openai' && OPENAI_ORGANIZATION) && {
        'OpenAI-Organization': OPENAI_ORGANIZATION,
      }),
    },
    method: 'POST',
    body: JSON.stringify({
      ...(OPENAI_API_TYPE === 'openai' && {model: model.id}),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      max_tokens: model?.tokenLimit || 1000,
      temperature: temperature,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const result = await res.json();
    if (result.error) {
      console.log(result.error);
      throw new OpenAIError(
        result.error.message,
        result.error.type,
        result.error.code,
      );
    } else {
      throw new Error(
        `OpenAI API returned an error: ${
          decoder.decode(result?.value) || result.statusText
        }`,
      );
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;
              if (data != '[DONE]') {
                try {
                  const json = JSON.parse(data);
                  if (json.choices[0].finish_reason != null) {
                    controller.close();
                    return;
                  }
                  const text = json.choices[0]?.delta?.content || '';
                  const queue = encoder.encode(text);
                  controller.enqueue(queue);
                } catch (e) {
                  controller.error(e);
                }
              }
        }
      };

      const parser = createParser(onParse);

      // prepend string
      if (prependString) {
        const queue = encoder.encode(prependString);
        controller.enqueue(queue);
      }

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};

export const AnthropicStream = async (
  model: AnthropicModel,
  systemPrompt: string,
  temperature: number,
  key: string,
  messages: Message[],
  prependString?: string,
) => {
  const url = 'https://api.anthropic.com/v1/messages';
  
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'messages-2023-12-15',
      'X-API-Key': key,
    } as HeadersInit,
    method: 'POST',
    body: JSON.stringify({
      model: model.id,
      messages: [
        ...messages,
      ],
      system: systemPrompt,
      max_tokens: model?.tokenLimit || 1000,
      temperature: temperature,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const result = await res.json();
    if (result.error) {
      throw new AnthropicError(
        result.error.message,
        result.error.type,
        result.error.code,
      );
    } else {
      throw new Error(`Anthropic API returned an error: ${decoder.decode(result?.value) || result.statusText}`);
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;
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
      };

      const parser = createParser(onParse);

      // prepend string
      if (prependString) {
        const queue = encoder.encode(prependString);
        controller.enqueue(queue);
      }

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};


