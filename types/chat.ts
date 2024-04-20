import { AnthropicModel } from './anthropic';
import { OpenAIModel } from './openai';
import { ApiKeys, PluginOption } from './plugin';
import {GroqModel} from "@/types/groq";

export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  model: OpenAIModel | AnthropicModel | GroqModel;
  messages: Message[];
  keys: ApiKeys;
  prompt: string;
  temperature: number;
  options?: PluginOption[];
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: OpenAIModel | AnthropicModel;
  promptMode: string;
  prompt: string;
  temperature: number;
  folderId: string | null;
  options?: PluginOption[];
}
