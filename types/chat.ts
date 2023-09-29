import { OpenAIModel } from './openai';
import { PluginOption } from './plugin';

export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  model: OpenAIModel;
  messages: Message[];
  key: string;
  prompt: string;
  temperature: number;
  options?: PluginOption[];
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: OpenAIModel;
  promptMode: string;
  prompt: string;
  temperature: number;
  folderId: string | null;
  options?: PluginOption[];
}
