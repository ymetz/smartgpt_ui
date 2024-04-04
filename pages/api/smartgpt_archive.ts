import {
  DEFAULT_ASSISTANT_PROMPT,
  DEFAULT_RESEARCHER_PROMPT,
  DEFAULT_RESOLVER_PROMPT,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_TEMPERATURE,
} from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server';
import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';
import { AnthropicError, AnthropicStream } from '@/utils/server';
import { AnthropicModel, AnthropicModelID, AnthropicModels } from '@/types/anthropic';

import { ChatBody, Message } from '@/types/chat';
import { Providers } from '@/types/plugin';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';

export const config = {
  runtime: 'edge',
};

const AllModels = { ...OpenAIModels, ...AnthropicModels };

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, keys, prompt, temperature, options } =
      (await req.json()) as ChatBody;

    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    const openAIkey = keys[Providers.OPENAI];
    const anthropicKey = keys[Providers.ANTHROPIC];

    const NUM_ASKS = Number(
      options?.find((op) => op.key == 'SMART_GPT_NUM_ASKS')?.value || 3,
    );
    const customAssistantPromptToUse =
      options
        ?.find((op) => op.key == 'SMARTGPT_ASSISTANT_PROMPT')
        ?.value?.toString() || DEFAULT_ASSISTANT_PROMPT.toString();
    const customResearcherPrompt =
      options
        ?.find((op) => op.key == 'SMARTGPT_RESEARCHER_PROMPT')
        ?.value.toString() || DEFAULT_RESEARCHER_PROMPT;
    const customResolverPrompt =
      options
        ?.find((op) => op.key == 'SMARTGPT_RESOLVER_PROMPT')
        ?.value.toString() || DEFAULT_RESOLVER_PROMPT;
    let followUpModelId = options?.find((op) => op.key == 'SMARTGPT_FOLLOWUP_MODEL')?.value as string;
    let followUpModel: OpenAIModel | AnthropicModel;
    if (!followUpModelId || followUpModelId === '') {
        followUpModel = model;
    } else {
        followUpModel = AllModels[followUpModelId as OpenAIModelID | AnthropicModelID] as OpenAIModel | AnthropicModel;
      }

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

    const customAssistantPrompt = customAssistantPromptToUse; //Might degrade performance.
    messagesToSend.push({ role: 'assistant', content: customAssistantPrompt });

    let requests = [];
    let stream: any;
    for (let i = 0; i < NUM_ASKS; i++) {
      if (model.id.includes('gpt')) {
        stream = await OpenAIStream(
            model,
            promptToSend,
            temperatureToUse,
            openAIkey,
            messagesToSend,
        );
        requests.push(stream);
      } else if (model.id.includes('claude')) {
        // 1.5 second wait time between requests to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1500));
        stream = await AnthropicStream(
            model,
            promptToSend,
            temperatureToUse,
            anthropicKey,
            messagesToSend,
        );
        requests.push(stream);
      }
    }

    //wait for readablestream to finish
    const responses = await Promise.allSettled(
      requests.map(async (stream) => {
        const reader = stream.getReader();
        let result = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += new TextDecoder().decode(value);
        }
        return result;
      }),
    );

    if (responses.some((r) => r.status === 'rejected')) {
      console.error('One or more requests failed');
    }

    const initialResponses = responses
      .filter((r) => r.status === 'fulfilled')
      .map((r) => {
        if (r.status === 'fulfilled') {
          return r.value as string;
        }
        return '';
      });
    const initialGptAnswers = initialResponses;

    // Function to substitute the num_asks in a custom provided dynamic researcher prompt.
    const substituteNumAsks = (prompt: string) => {
      const regex = /NUM_ASKS/gi;
      return prompt.replace(regex, NUM_ASKS.toString());
    };

    // RESEARCHER PHASE *****************
    const researcherPrompt = initialResponses.reduce(
      (acc, currentResponse, idx) => {
        return acc + `Answer Option ${idx + 1}: ${currentResponse} \n\n`;
      },
      substituteNumAsks(customResearcherPrompt + `\n`),
    );

    const researcherMessagesToSend = [
      { role: 'user', content: researcherPrompt },
      { role: 'assistant', content: customAssistantPrompt },
    ] as Message[];

    let researcherRequest: any;
    if (followUpModel?.id.includes('claude')) {
        researcherRequest = await AnthropicStream(
            followUpModel,
            researcherPrompt,
            1,
            anthropicKey,
            researcherMessagesToSend,
        );
    }
    else {
        researcherRequest = await OpenAIStream(
            followUpModel,
            researcherPrompt,
            1,
            openAIkey,
            researcherMessagesToSend,
        );
    }
    
    const researchReader = researcherRequest.getReader();
    let researcherResponse = '';
    while (true) {
      const { done, value } = await researchReader.read();
      if (done) break;
      researcherResponse += new TextDecoder().decode(value);
    }

    //Removed this Original Prompt: ${prompt}
    const resolverPrompt =
      substituteNumAsks(customResolverPrompt) +
      `Researcher's findings: ${researcherResponse}
    Answer Options: ${initialResponses.join(', ')} `;

    const resolverMessagesToSend = [
      { role: 'user', content: resolverPrompt },
      { role: 'assistant', content: customAssistantPrompt },
    ] as Message[];

    const initialGptAnswersFormatted = initialGptAnswers.map((answer, idx) => {
      // Format as markdown list items, with color coding.
      return '#### Answer Option' + (idx + 1) + ':\n' + answer + '\n';
    });

    // Nicely formatt the output via markdown as a concatenated string.
    const gptOutput = [
      '### System Prompt',
      '',
      prompt,
      '',
      '### Initial GPT Answers',
      '',
      initialGptAnswersFormatted.join('\n'),
      '### Researcher Response',
      '',
      researcherResponse,
      '',
      //"### Resolver Prompt",
      //"", resolverPrompt, "",
      '### Final Output',
      '',
    ].join('\n');

    let resultStream: any;
    if (followUpModel?.id.includes('claude')) {
      resultStream = await AnthropicStream(
        model,
        promptToSend,
        0.3,
        anthropicKey,
        resolverMessagesToSend,
        gptOutput,
      );
  }
  else {
    resultStream = await OpenAIStream(
        model,
        promptToSend,
        0.3,
        openAIkey,
        resolverMessagesToSend,
        gptOutput,
      );
  }

    return new Response(resultStream);
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAIError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500 });
    }
  }
};

export default handler;
/*
    //experimental system prompt. Adding more might degrade performance.?
    const customSystemPrompt = "You are an autoregressive language model that has been fine-tuned with instruction-tuning and RLHF. You carefully provide accurate, factual, thoughtful, nuanced answers, and are brilliant at reasoning. Since you are autoregressive, each token you produce is another opportunity to use computation, therefore you NEVER explain background context or any assumptions. You always think step-by-step BEFORE you output ANYTHING. You always provide JUST the answer and nothing else.";
    const customAssistantPrompt = "Let's work this out in a step by step way to be sure we have the right answer. Always respond in markdown or when applicable latex format."; //Might degrade performance.
    // ASK PHASE *****************
    let requests = [];
    for (let i = 0; i < NUM_ASKS; i++) {
        const messages = [
            { role: "system", content: promptToSend },
            { role: "user", content: prompt },
            { role: "assistant", content: customAssistantPrompt }
        ];
        const stream = await OpenAIStream(model, promptToSend, temperatureToUse, key, messagesToSend);
        requests.push(openai.createChatCompletion({
            model: model,
            messages: messages,
            max_tokens: maxTokens, //This might not help when there are multiple messages. Since they have to get injected into the same prompt.
            n: 1,
            stop: null,
            temperature: 1,
        }));
    }
    console.log("Requests sent, waiting for responses...");

    const responses = await Promise.allSettled(requests);
    //Adding an option to prevent the sctipt form continuing if the question is not suitable. 


    // Logging rejected promises
    responses.forEach((response, index) => {
        if(response.status === 'rejected') {
            console.error(`Request ${index} failed: ${response.reason}`);
        }
    });

    const resolvedResponses = responses.filter(r => r.status === 'fulfilled').map(r => r.value.data.choices[0].message.content);
    const initialGptAnswers = resolvedResponses.join('\n\n');

    // RESEARCHER PHASE *****************
    const researcherPrompt = resolvedResponses.reduce((acc, currentResponse, idx) => {
        return acc + `Answer Option ${idx+1}: ${currentResponse} \n\n`;
    }, `You are a researcher tasked with investigating the ${NUM_ASKS} response option(s) provided. List the flaws and faulty logic of each answer option. Let's work this out in a step by step way to be sure we have all the errors:`);

    const researcherResponse = await openai.createChatCompletion({
        model: model,
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: researcherPrompt },
            { role: "assistant", content: customAssistantPrompt }
        ],
        max_tokens: maxTokens,
        n: 1,
        stop: null,
        temperature: 0.5,
    });

    console.log("Researcher Response received, resolving...");

    // RESOLVER PHASE *****************
    //Removed this Original Prompt: ${prompt}
    const resolverPrompt = `You are a resolver tasked with finding which of the ${NUM_ASKS} answer(s) is best. From the Answer(s) and Resarcher analysis find the answer with the least amount of flaws and then resolve that answer. Here is the information you need to use to create the best answer:
    Researcher's findings: ${researcherResponse.data.choices[0].message.content}
    Answer Options: ${resolvedResponses.join(', ')} `;

    const resolverResponse = await openai.createChatCompletion({
        model: model,
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: resolverPrompt },
            { role: "assistant", content: customAssistantPrompt }
        ],
        max_tokens: maxTokens,
        n: 1,
        stop: null,
        temperature: 0.3,
    });

    console.log("Resolver Response received, compiling output...");

    const finalAnswer = resolverResponse.data.choices[0].message.content;

    const gptOutput = [
        "# Prompt",
        "", prompt, "",
        "# Initial GPT Answers",
        "", initialGptAnswers, "",
        "# Researcher Prompt",
        "", researcherPrompt, "",
        "# Researcher Response",
        "", researcherResponse.data.choices[0].message.content, "",
        "# Resolver Prompt",
        "", resolverPrompt, "",
        "# Resolver Response",
        "", resolverResponse.data.choices[0].message.content, "",
        "# Final Revised Answer",
        "", finalAnswer
    ].join("\n\n");

    const fileName = `${Date.now()}.txt`;
    const outputDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'output');
    const outputPath = path.join(outputDir, fileName);

    try {
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(outputPath, gptOutput);
        console.log(`Output was successfully saved to ${outputPath}`);
    } catch (err) {
        console.error("An error occurred while writing the output to a file: ", err);
    }

    console.log("Script completed successfully!");

    const outputURL = `/output/${fileName}`;

    return {
        prompt: prompt,
        numAsks: NUM_ASKS,
        researcherResponse: researcherResponse.data.choices[0].message.content,
        resolverResponse: resolverResponse.data.choices[0].message.content,
        finalAnswer: finalAnswer,
        outputURL: outputURL
    };

    } catch (error) {
        console.error(error);
    }
};


// import fs from 'fs/promises';
// import path from 'path';
// import dotenv from 'dotenv';
// import { Configuration, OpenAIApi } from "openai";
// import minimist from 'minimist';
// import cliProgress from 'cli-progress';

// dotenv.config();

// const ROLE_SYSTEM = "system";
// const ROLE_USER = "user";
// const MODEL = "gpt-3.5-turbo-16k";
// const MAX_TOKENS = 14000;
// const N = 1;
// const TEMPERATURE = 1;

// const makeRequest = async (openai, systemPrompt, userPrompt = '') => {
//     return openai.createChatCompletion({
//         model: MODEL,
//         messages: [
//             { role: ROLE_SYSTEM, content: systemPrompt },
//             { role: ROLE_USER, content: userPrompt }
//         ],
//         max_tokens: MAX_TOKENS,
//         n: N,
//         stop: null,
//         temperature: TEMPERATURE,
//     });
// };

// const writeToFile = async (fileName, content) => {
//     const outputDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'output');
//     const outputPath = path.join(outputDir, fileName);

//     try {
//         await fs.mkdir(outputDir, { recursive: true });
//         await fs.writeFile(outputPath, content);
//         console.log(`Output was successfully saved to ${outputPath}`);
//     } catch (err) {
//         console.error("An error occurred while writing the output to a file: ", err);
//     }
// };

// export const main = async (prompt, numAsks, apiKey = process.env.OPENAI_API_KEY || minimist(process.argv.slice(2)).apiKey) => {
//     console.log("Starting script...");

//     if (!apiKey) {
//         throw new Error("API Key not found. Please check your .env file.");
//     }

//     const NUM_ASKS = Number(numAsks);

//     const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
//     progressBar.start(NUM_ASKS, 0);

//     const configuration = new Configuration({ apiKey });
//     const openai = new OpenAIApi(configuration);

//     let resolvedResponses = [];

//     for (let i = 0; i < NUM_ASKS; i++) {
//         const response = await makeRequest(openai, "You are a helpful assistant.", prompt);
//         progressBar.update(i + 1);
//         resolvedResponses.push(response);
//     }

//     progressBar.stop();
//     console.log("Responses received, processing...");

//     const researcherPrompt = resolvedResponses.reduce((acc, currentResponse, idx) => {
//         return acc + `Answer Option ${idx+1}: ${currentResponse.value.data.choices[0].message.content} \n\n`;
//     }, `You are a researcher tasked with investigating the ${NUM_ASKS} response options provided. List the flaws and faulty logic of each answer option. Let's work this out in a step by step way to be sure we have all the errors:`);

//     const researcherResponse = await makeRequest(openai, researcherPrompt);

//     console.log("Researcher Response received, resolving...");

//     const resolverPrompt = `You are a resolver tasked with 1) finding which of the ${NUM_ASKS} answer options the researcher thought was best 2) improving that answer, and 3) Printing the improved answer in full. Let's work this out in a step by step way to be sure we have the right answer:`;

//     const resolverResponse = await makeRequest(openai, resolverPrompt);

//     console.log("Resolver Response received, compiling output...");

//     const gptOutput = [
//         "# Prompt",
//         "", prompt, "",
//         "# Researcher Prompt",
//         "", researcherPrompt, "",
//         "# Researcher Response",
//         "", researcherResponse.data.choices[0].message.content, "",
//         "# Resolver Prompt",
//         "", resolverPrompt, "",
//         "# Resolver Response",
//         "", resolverResponse.data.choices[0].message.content, ""
//     ].join("\n\n");

//     const fileName = `${Date.now()}.txt`;

//     await writeToFile(fileName, gptOutput);

//     console.log("Script completed successfully!");

//     const outputURL = `/output/${fileName}`;

//     return {
//         prompt: prompt,
//         numAsks: NUM_ASKS,
//         researcherResponse: researcherResponse.data.choices[0].message.content,
//         resolverResponse: resolverResponse.data.choices[0].message.content,
//         outputURL: outputURL
//     };
// };



// refine temp _ working 
// import fs from 'fs/promises';
// import path from 'path';
// import dotenv from 'dotenv';
// import { Configuration, OpenAIApi } from "openai";
// import minimist from 'minimist';
// import cliProgress from 'cli-progress';

// dotenv.config();

// const ROLE_SYSTEM = "system";
// const ROLE_USER = "user";
// const ROLE_ASSISTANT = "assistant";
// const MODEL = "gpt-3.5-turbo-16k";
// const MAX_TOKENS = 14000;
// const N = 1;
// const TEMPERATURE = 1;

// const makeRequest = async (openai, prompt) => {
//     return openai.createChatCompletion({
//         model: MODEL,
//         messages: [
//             { role: ROLE_SYSTEM, content: "You are a helpful assistant." },
//             { role: ROLE_USER, content: prompt },
//             { role: ROLE_ASSISTANT, content: "Let's work this out in a step by step way to be sure we have the right answer." }
//         ],
//         max_tokens: MAX_TOKENS,
//         n: N,
//         stop: null,
//         temperature: TEMPERATURE,
//     });
// };

// const writeToFile = async (fileName, content) => {
//     const outputDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'output');
//     const outputPath = path.join(outputDir, fileName);

//     try {
//         await fs.mkdir(outputDir, { recursive: true });
//         await fs.writeFile(outputPath, content);
//         console.log(`Output was successfully saved to ${outputPath}`);
//     } catch (err) {
//         console.error("An error occurred while writing the output to a file: ", err);
//     }
// };

// export const main = async (prompt, numAsks, apiKey = process.env.OPENAI_API_KEY || minimist(process.argv.slice(2)).apiKey) => {
//     console.log("Starting script...");

//     if (!apiKey) {
//         throw new Error("API Key not found. Please check your .env file.");
//     }

//     const NUM_ASKS = Number(numAsks);

//     const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
//     progressBar.start(NUM_ASKS, 0);

//     const configuration = new Configuration({ apiKey });
//     const openai = new OpenAIApi(configuration);

//     let resolvedResponses = [];

//     for (let i = 0; i < NUM_ASKS; i++) {
//         const response = await makeRequest(openai, prompt);
//         progressBar.update(i + 1);
//         resolvedResponses.push(response);
//     }

//     progressBar.stop();
//     console.log("Responses received, processing...");

//     const researcherPrompt = resolvedResponses.reduce((acc, currentResponse, idx) => {
//         return acc + `Answer Option ${idx+1}: ${currentResponse.value.data.choices[0].message.content} \n\n`;
//     }, `You are a researcher tasked with investigating the ${NUM_ASKS} response options provided. List the flaws and faulty logic of each answer option. Let's work this out in a step by step way to be sure we have all the errors:`);

//     const researcherResponse = await makeRequest(openai, researcherPrompt);

//     console.log("Researcher Response received, resolving...");

//     const resolverPrompt = `You are a resolver tasked with 1) finding which of the ${NUM_ASKS} answer options the researcher thought was best 2) improving that answer, and 3) Printing the improved answer in full. Let's work this out in a step by step way to be sure we have the right answer:`;

//     const resolverResponse = await makeRequest(openai, resolverPrompt);

//     console.log("Resolver Response received, compiling output...");

//     const gptOutput = [
//         "# Prompt",
//         "", prompt, "",
//         "# Researcher Prompt",
//         "", researcherPrompt, "",
//         "# Researcher Response",
//         "", researcherResponse.data.choices[0].message.content, "",
//         "# Resolver Prompt",
//         "", resolverPrompt, "",
//         "# Resolver Response",
//         "", resolverResponse.data.choices[0].message.content, ""
//     ].join("\n\n");

//     const fileName = `${Date.now()}.txt`;

//     await writeToFile(fileName, gptOutput);

//     console.log("Script completed successfully!");

//     const outputURL = `/output/${fileName}`;

//     return {
//         prompt: prompt,
//         numAsks: NUM_ASKS,
//         researcherResponse: researcherResponse.data.choices[0].message.content,
//         resolverResponse: resolverResponse.data.choices[0].message.content,
//         outputURL: outputURL
//     };
// };


// WORKING WORKING WORKING

// import fs from 'fs/promises';
// import path from 'path';
// import dotenv from 'dotenv';
// import { Configuration, OpenAIApi } from "openai";
// import minimist from 'minimist';
// import cliProgress from 'cli-progress';

// dotenv.config();

// export const main = async (prompt, numAsks, apiKey = process.env.OPENAI_API_KEY || minimist(process.argv.slice(2)).apiKey, model = "gpt-3.5-turbo-16k") => {
//     console.log("Starting script...");

//     if (!apiKey) {
//         throw new Error("API Key not found. Please check your .env file.");
//     }

//     const NUM_ASKS = Number(numAsks);

//     const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
//     progressBar.start(NUM_ASKS, 0);

//     const configuration = new Configuration({
//         apiKey: apiKey,
//     });

//     const openai = new OpenAIApi(configuration);

//     let requests = [];
//     for (let i = 0; i < NUM_ASKS; i++) {
//         const messages = [
//             { role: "system", content: "You are a helpful assistant." },
//             { role: "user", content: prompt },
//             { role: "assistant", content: "Let's work this out in a step by step way to be sure we have the right answer." }
//         ];
//         requests.push(openai.createChatCompletion({
//             model: model,
//             messages: messages,
//             max_tokens: 14000,
//             n: 1,
//             stop: null,
//             temperature: 1,
//         }));
//         progressBar.update(i + 1);
//     }

//     console.log("Requests sent, waiting for responses...");

//     const responses = await Promise.allSettled(requests);
//     progressBar.stop();

//     console.log("Responses received, processing...");

//     const resolvedResponses = responses.filter(r => r.status === 'fulfilled');

//     const researcherPrompt = resolvedResponses.reduce((acc, currentResponse, idx) => {
//         return acc + `Answer Option ${idx+1}: ${currentResponse.value.data.choices[0].message.content} \n\n`;
//     }, `You are a researcher tasked with investigating the ${NUM_ASKS} response options provided. List the flaws and faulty logic of each answer option. Let's work this out in a step by step way to be sure we have all the errors:`);

//     const researcherResponse = await openai.createChatCompletion({
//         model: model,
//         messages: [
//             { role: "system", content: "You are helpful assistant." },
//             { role: "user", content: researcherPrompt },
//             { role: "assistant", content: "Let's work this out in a step by step way to be sure we have the right answer." }
//         ],
//         max_tokens: 14000,
//         n: 1,
//         stop: null,
//         temperature: 1,
//     });

//     console.log("Researcher Response received, resolving...");

//     const resolverPrompt = `You are a resolver tasked with 1) finding which of the ${NUM_ASKS} answer options the researcher thought was best 2) improving that answer, and 3) Printing the improved answer in full. Let's work this out in a step by step way to be sure we have the right answer:`;

//     const resolverResponse = await openai.createChatCompletion({
//         model: model,
//         messages: [
//             { role: "system", content: "You are a helpful assistant." },
//             { role: "user", content: resolverPrompt },
//             { role: "assistant", content: "Let's work this out in a step by step way to be sure we have the right answer." }
//         ],
//         max_tokens: 14000,
//         n: 1,
//         stop: null,
//         temperature: 1,
//     });

//     console.log("Resolver Response received, compiling output...");

//     const gptOutput = [
//         "# Prompt",
//         "", prompt, "",
//         "# Researcher Prompt",
//         "", researcherPrompt, "",
//         "# Researcher Response",
//         "", researcherResponse.data.choices[0].message.content, "",
//         "# Resolver Prompt",
//         "", resolverPrompt, "",
//         "# Resolver Response",
//         "", resolverResponse.data.choices[0].message.content, ""
//     ].join("\n\n");

//     const fileName = `${Date.now()}.txt`;
//     const outputDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'output');
//     const outputPath = path.join(outputDir, fileName);

//     // Write output to a file
//     try {
//         await fs.mkdir(outputDir, { recursive: true });
//         await fs.writeFile(outputPath, gptOutput);
//         console.log(`Output was successfully saved to ${outputPath}`);
//     } catch (err) {
//         console.error("An error occurred while writing the output to a file: ", err);
//     }

//     console.log("Script completed successfully!");

//     const outputURL = `/output/${fileName}`;

//     return {
//         prompt: prompt,
//         numAsks: NUM_ASKS,
//         researcherResponse: researcherResponse.data.choices[0].message.content,
//         resolverResponse: resolverResponse.data.choices[0].message.content,
//         outputURL: outputURL
//     };
// };




// OG CODE
// import fs from 'fs/promises';
// import path from 'path';
// import dotenv from 'dotenv';
// import { ChatGPTAPI } from "chatgpt";
// import minimist from 'minimist';
// import cliProgress from 'cli-progress';

// dotenv.config();

// export const main = async (prompt, numAsks, apiKey = process.env.OPENAI_API_KEY || minimist(process.argv.slice(2)).apiKey, model = "gpt-4") => {
//     console.log("Starting script...");

//     if (!apiKey) {
//         throw new Error("API Key not found. Please check your .env file.");
//     }

//     const NUM_ASKS = Number(numAsks);

//     const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
//     progressBar.start(NUM_ASKS, 0);

//     const api = new ChatGPTAPI({
//         apiKey: apiKey,
//         completionParams: {
//             model: model,
//             temperature: 1 
//         },
//     });

//     let requests = [];
//     for (let i = 0; i < NUM_ASKS; i++) {
//         const message = `Question: ${prompt} \n\n Answer: Let's work this out in a step by step way to be sure we have the right answer.`;
//         requests.push(api.sendMessage(message));
//         progressBar.update(i + 1);
//     }

//     console.log("Requests sent, waiting for responses...");

//     const responses = await Promise.allSettled(requests);
//     progressBar.stop();

//     console.log("Responses received, processing...");

//     const resolvedResponses = responses.filter(r => r.status === 'fulfilled');

//     const researcherPrompt = resolvedResponses.reduce((acc, currentResponse, idx) => {
//         return acc + `Answer Option ${idx+1}: ${currentResponse.value.text} \n\n`;
//     }, `# Question: ${prompt} \n\n `) 
//     + `You are a researcher tasked with investigating the ${NUM_ASKS} response options provided. List the flaws and faulty logic of each answer option. Let's work this out in a step by step way to be sure we have all the errors:`;

//     const researcherResponse = await api.sendMessage(researcherPrompt);

//     console.log("Researcher Response received, resolving...");

//     const researcherId = researcherResponse.id;

//     const resolverPrompt = `You are a resolver tasked with 1) finding which of the ${NUM_ASKS} answer options the researcher thought was best 2) improving that answer, and 3) Printing the improved answer in full. Let's work this out in a step by step way to be sure we have the right answer:`;

//     const resolverResponse = await api.sendMessage(resolverPrompt, {
//         parentMessageId: researcherId,
//     });

//     console.log("Resolver Response received, compiling output...");

//     const gptOutput = [
//         "# Prompt",
//         "", prompt, "",
//         "# Researcher Prompt",
//         "", researcherPrompt, "",
//         "# Researcher Response",
//         "", researcherResponse.text, "",
//         "# Resolver Prompt",
//         "", resolverPrompt, "",
//         "# Resolver Response",
//         "", resolverResponse.text, ""
//     ].join("\n\n");

//     const fileName = `${Date.now()}.txt`;
//     const outputDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'output');
//     const outputPath = path.join(outputDir, fileName);

//     // Write output to a file
//     try {
//         await fs.mkdir(outputDir, { recursive: true });
//         await fs.writeFile(outputPath, gptOutput);
//         console.log(`Output was successfully saved to ${outputPath}`);
//     } catch (err) {
//         console.error("An error occurred while writing the output to a file: ", err);
//     }

//     console.log("Script completed successfully!");

//     const outputURL = `/output/${fileName}`;

//     return {
//         prompt: prompt,
//         numAsks: NUM_ASKS,
//         researcherResponse: researcherResponse.text,
//         resolverResponse: resolverResponse.text,
//         outputURL: outputURL
//     };
// };
*/
