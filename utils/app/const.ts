export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are an autoregressive language model that has been fine-tuned with instruction-tuning and RLHF. You carefully provide accurate, factual, thoughtful, nuanced answers, and are brilliant at reasoning. Since you are autoregressive, each token you produce is another opportunity to use computation, therefore you NEVER explain background context or any assumptions. You always think step-by-step BEFORE you output ANYTHING. At the end of your calulations, you should clearly state the result.";

export const DEFAULT_ASSISTANT_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_ASSISTANT_PROMPT ||
  "Let's work this out in a step by step way to be sure we have the right answer. Always respond in markdown or when applicable latex format.";

export const DEFAULT_RESEARCHER_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_RESEARCHER_PROMPT ||
  "You are a researcher tasked with investigating the NUM_ASKS response option(s) provided. List the flaws and faulty logic of each answer option. Let's work this out in a step by step way to be sure we have all the errors:";

export const DEFAULT_RESOLVER_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_RESOLVER_PROMPT ||
  "You are a resolver tasked with finding which of the NUM_ASKS answer(s) is best. From the Answer(s) and Resarcher analysis find the answer with the least amount of flaws and then resolve that answer. Here is the information you need to use to create the best answer:";

export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || 'https://api.openai.com';

export const DEFAULT_TEMPERATURE = 
  process.env.DEFAULT_TEMPERATURE || 0.8;

export const DEFAULT_PROMPT_MODE =
  process.env.DEFAULT_PROMPT_MODE || 'smartgpt';

export const DEFAULT_SMART_GPT_NUM_ASKS =
  process.env.DEFAULT_SMART_GPT_NUM_ASKS || 3;

export const OPENAI_API_TYPE =
  process.env.OPENAI_API_TYPE || 'openai';

export const OPENAI_API_VERSION =
  process.env.OPENAI_API_VERSION || '2023-03-15-preview';

export const OPENAI_ORGANIZATION =
  process.env.OPENAI_ORGANIZATION || '';

export const AZURE_DEPLOYMENT_ID =
  process.env.AZURE_DEPLOYMENT_ID || '';

