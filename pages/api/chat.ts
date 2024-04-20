import {DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE} from '@/utils/app/const';
import {AnthropicError, AnthropicStream, GroqError, GroqStream, OpenAIError, OpenAIStream,} from '@/utils/server';

import {ChatBody, Message} from '@/types/chat';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import {init, Tiktoken} from '@dqbd/tiktoken/lite/init';
import {Providers} from "@/types/plugin";

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, keys, prompt, temperature } =
      (await req.json()) as ChatBody;

    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE as number;
      if (typeof temperatureToUse === 'string') {
        temperatureToUse = parseFloat(temperatureToUse);
      }
    }

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const tokens = encoding.encode(message.content);

      if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
      messagesToSend = [message, ...messagesToSend];
    }

    encoding.free();

    let stream: any;
    if (model.id.includes('gpt')) {
      stream = await OpenAIStream(
        model,
        promptToSend,
        temperatureToUse,
        keys.openai,
        messagesToSend,
      );
    } else if (model.id.includes('claude')) {
      stream = await AnthropicStream(
        model,
        promptToSend,
        temperatureToUse,
        keys.anthropic,
        messagesToSend,
      );
    } else if (model.name.includes('@Groq')) {
      stream = await GroqStream(
          model,
          promptToSend,
          temperatureToUse,
          keys.groq,
          messagesToSend
      );
    } else {
      return new Response('Error: Unknown Model', { status: 500 , statusText: 'Unknown Model'});
    }

    return new Response(stream);
  } catch (error) {
    if (error instanceof OpenAIError || error instanceof AnthropicError || error instanceof GroqError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500 });
    }
  }
};

export default handler;
