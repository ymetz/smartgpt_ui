import {
  DEFAULT_TEMPERATURE,
  DEFAULT_ASSISTANT_PROMPT,
  DEFAULT_RESEARCHER_PROMPT,
  DEFAULT_RESOLVER_PROMPT,
  DEFAULT_SYSTEM_PROMPT,
} from '@/utils/app/const';
import { OpenAIStream, AnthropicStream, OpenAIError } from '@/utils/server';
import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';
import { AnthropicModel, AnthropicModelID, AnthropicModels } from '@/types/anthropic';
import { ChatBody, Message } from '@/types/chat';
import { Providers } from '@/types/plugin';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';

const AllModels = { ...OpenAIModels, ...AnthropicModels };

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, keys, prompt, temperature, options } =
      (await req.json()) as ChatBody;
    const openAIkey = keys[Providers.OPENAI];
    const anthropicKey = keys[Providers.ANTHROPIC];

    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    let initialSystemPrompt = prompt || DEFAULT_SYSTEM_PROMPT;
    let temperatureToUse = temperature || DEFAULT_TEMPERATURE;
    let assistantPrompt = options?.find((op) => op.key == 'SMARTGPT_ASSISTANT_PROMPT')?.value?.toString() || DEFAULT_ASSISTANT_PROMPT.toString();
    let researcherPrompt = options?.find((op) => op.key == 'SMARTGPT_RESEARCHER_PROMPT')?.value?.toString() || DEFAULT_RESEARCHER_PROMPT.toString();
    let resolverPrompt = options?.find((op) => op.key == 'SMARTGPT_RESOLVER_PROMPT')?.value?.toString() || DEFAULT_RESOLVER_PROMPT.toString();
    let numInitialAsks = options?.find((op) => op.key == 'SMART_GPT_NUM_ASKS')?.value as number || 3;
    const prompt_tokens = encoding.encode(initialSystemPrompt);
    let tokenCount = prompt_tokens.length;
    let followUpModelId = options?.find((op) => op.key == 'SMARTGPT_FOLLOWUP_MODEL')?.value as string;
    let followUpModel: OpenAIModel | AnthropicModel;
    if (!followUpModelId || followUpModelId === '') {
        followUpModel = model;
    } else {
        followUpModel = AllModels[followUpModelId as OpenAIModelID | AnthropicModelID] as OpenAIModel | AnthropicModel;
      }
    
    let messagesToSend: Message[] = [...messages];

    
    for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        const tokens = encoding.encode(message.content);
  
        if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
          break;
        }
        tokenCount += tokens.length;
        messagesToSend = [message, ...messagesToSend];
    }
    // convert messagesToSend to a promise
    messagesToSend.push({ role: 'assistant', content: assistantPrompt });
    const messagesToSendPromise = Promise.resolve(messagesToSend);
    encoding.free();

    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();

    // Function to process stream and return its text content
    const processStreamAndGetText = async (model: OpenAIModel | AnthropicModel | null, messages: Promise<Message[]>, waitForDone: boolean = false, prependString?: string, closeWriter: boolean = false): Promise<string> => {
      let stream;
      let textContent = '';
      if (model) {
        if (model.id.includes('gpt')) {
          stream = await OpenAIStream(model, initialSystemPrompt, temperatureToUse, openAIkey, await messages, undefined);
        } else if (model.id.includes('claude')) {
          stream = await AnthropicStream(model, initialSystemPrompt, temperatureToUse, anthropicKey, await messages, undefined);
        }
      }
      if (prependString && !waitForDone) {
        // we can just have a prepend string, just return it as is
          writer.write(new TextEncoder().encode(prependString));
      }

      if (!stream) return '';

      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        // for parallel call, we should wait so that the text is written in order
        if (!waitForDone)
          writer.write(value); // Write to the transform stream as well
        textContent += text;
      }

      if (waitForDone) {
        if (prependString) {
          writer.write(new TextEncoder().encode(prependString));
        }
        writer.write(new TextEncoder().encode(textContent));
      }

      if (closeWriter) {
        writer.close();
      }

      return textContent;
    };

    // send initial system prompt back to the client
    processStreamAndGetText(null, Promise.resolve([]), false, `### System Prompt:\n${initialSystemPrompt}\n\n### Initial GPT Answers (${numInitialAsks} Asks, Model: ${model?.id || 'unknown model'}):\n`);

    // ASK phase
    /*const initialAskPromises = Array.from({ length: numInitialAsks }, () => processStreamAndGetText(model, messagesToSendPromise));
    const initialResponseTexts = Promise.all(initialAskPromises);*/
    // for the initial asks, we want to attach the index of the ask to the response so we can identify it later
    const initialAskPromises = Array.from({ length: numInitialAsks }, (_, i) => processStreamAndGetText(model, messagesToSendPromise, true, `\n#### Answer:\n`));
    const initialResponseTexts = Promise.all(initialAskPromises);

    // Process the initial response text to prepare messages for the researcher phase
    const researcherMessages = prepareResearcherMessages(initialResponseTexts, numInitialAsks, researcherPrompt, assistantPrompt);

    // RESEARCHER phase
    const researcherResponsePromise = processStreamAndGetText(followUpModel, researcherMessages, false, `\n### Researcher Prompt  (Model: ${followUpModel?.id || 'unknown model'}):\n${substituteNumAsks(researcherPrompt, numInitialAsks)}\n\n### Researcher Response:\n`);

    // Assuming you have a function to prepare messages for the resolver phase
    // RESOLVER phase could be similar to the RESEARCHER phase, based on your application logic
    const resolverMessagesPromise = prepareResolverMessages(researcherResponsePromise, initialResponseTexts, numInitialAsks, resolverPrompt, assistantPrompt);

    // Send the resolver messages to the model
    processStreamAndGetText(followUpModel, resolverMessagesPromise, false, `\n### Resolver Prompt (Model: ${followUpModel?.id || 'unknown model'}):\n${substituteNumAsks(resolverPrompt, numInitialAsks)}\n\n### Resolver Response:\n`, true);

    return new Response(transformStream.readable, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
  
};

export default handler;

/**
 * Function to substitute the num_asks in a custom provided dynamic researcher prompt.
 * @param prompt
 * @param numInitialAsks
 * @returns
 */
function substituteNumAsks(prompt: string,numInitialAsks: number) {
  const regex = /NUM_ASKS/gi;
  return prompt.replace(regex, numInitialAsks.toString());
}

/**
 * Create the researcher messages to be sent to the model, incorporating the initial responses
 * @param initialResponseTexts
 * @param numInitialAsks 
 * @param researcherAssistantPrompt 
 * @returns 
 */
async function prepareResearcherMessages(initialResponseTexts: Promise<string[]>, numInitialAsks: number, researcherPrompt: string, assistantPrompt: string): Promise<Message[]> {
    const sendResearcherPrompt = await initialResponseTexts.then((responses) =>
      responses.reduce(
        (acc, currentResponse, idx) =>
          acc + `Answer Option ${idx + 1}: ${currentResponse} \n\n`,
        substituteNumAsks(researcherPrompt + `\n`, numInitialAsks)
      )
    );

    const researcherMessagesToSend = [
      { role: 'user', content: sendResearcherPrompt },
      { role: 'assistant', content: assistantPrompt },
    ] as Message[];

    return researcherMessagesToSend;
}

/**
 * Create the resolver messages to be sent to the model, incorporating the initial responses and the researcher's findings
 * @param researcherResponse
 * @param initialResponses 
 * @param numInitialAsks 
 * @param resolverSystemPrompt 
 * @param resolverAssistantPrompt 
 */
async function prepareResolverMessages(researcherResponse: Promise<string>, initialResponses: Promise<string[]>, numInitialAsks: number, resolverPrompt: string, assistantPrompt: string): Promise<Message[]> {
  const sendResolverPrompt =
    substituteNumAsks(resolverPrompt, numInitialAsks) +
    `Researcher's findings: ${await researcherResponse}
  Answer Options: ${await initialResponses.then((responses) =>
    responses.reduce(
      (acc, currentResponse, idx) =>
        acc + `Option ${idx + 1}: ${currentResponse} \n\n`,
      ''
    )
  )}`;

  const resolverMessagesToSend = [
    { role: 'user', content: sendResolverPrompt },
    { role: 'assistant', content: assistantPrompt },
  ] as Message[];

  return resolverMessagesToSend;
}