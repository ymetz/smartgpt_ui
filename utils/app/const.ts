export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are a helpful assistant that always thinks step-by-step BEFORE you output ANYTHING. Lay out a reasoned plan for the task first, and then complete its steps carefully.";

export const DEFAULT_ASSISTANT_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_ASSISTANT_PROMPT ||
  "The following tasks are extremely important, and accurate answers are crucial for our users. Always respond in markdown or, when applicable, latex format..";

export const DEFAULT_RESEARCHER_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_RESEARCHER_PROMPT ||
  `You are a meticulous researcher tasked with investigating the NUM_ASKS response option(s) provided. Do not assume the most common answer is the correct one.
  1) Briefly enumerate the specific requirements of the task.
  2) Briefly list any flaws in the answers provided, including calculation/logical errors, subtle oversights and missed requirements.
  3) Quote specific improvements that could be made, and give targeted advice such as actionable edits.:`;

export const DEFAULT_RESOLVER_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_RESOLVER_PROMPT ||
  `You are a resolver tasked with printing the best of the NUM_ASKS answer(s), Print only that best answer, with any corrections found by the researcher. Remember, the user requires just a complete answer, so if the given answers contain too many errors to be corrected, simply print a complete answer yourself. DO NOT provide further analysis, justifications or context. For example:

  If Input was 'Answer 1: 1+1 = 3, 2+2 = 5, because of X, Answer 2: 1+1 = 2, 2+2 = 5, because of X, Answer 3: 1+1=4, 2+2 = 5' because of X and the researcher spotted the errors that 2+2 does not 5 and 1+1 does not equal 4' your output would simply be '1+1=2, 2+2=4 because of X`;
export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || 'https://api.openai.com';

export const ANTHROPIC_API_HOST =
  process.env.ANTHROPIC_API_HOST || 'https://api.anthropic.com';

export const GROQ_API_HOST =
    process.env.OPENAI_API_HOST || 'https://api.groq.com/openai';

export const MISTRAL_API_HOST =
  process.env.MISTRAL_API_HOST || 'https://api.mistral.ai';

export const GEMINI_API_HOST =
  process.env.GEMINI_API_HOST || 'https://generativelanguage.googleapis.com/v1beta';

export const DEFAULT_TEMPERATURE = 
  parseFloat(process.env.DEFAULT_TEMPERATURE || '0.9');

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

