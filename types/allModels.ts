import { AnthropicModels } from '@/types/anthropic';
import { OpenAIModels } from '@/types/openai';
import { GroqModels } from './groq';

const AllModels = {
  ...OpenAIModels,
  ...AnthropicModels,
  ...GroqModels,
};

export { AllModels };