import {ApiKeys, PluginOption} from './plugin';
import {BaseModel} from "@/types/BaseModel";

export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  model: BaseModel;
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
  model: BaseModel;
  promptMode: string;
  prompt: string;
  temperature: number;
  folderId: string | null;
  options?: PluginOption[];
}
