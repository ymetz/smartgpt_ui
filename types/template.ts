import { OpenAIModel } from './openai';

export interface Template {
  id: string;
  name: string;
  description: string;
  promptMode: string;
  num_asks: number;
  content: string;
  model: OpenAIModel;
  folderId: string | null;
}
