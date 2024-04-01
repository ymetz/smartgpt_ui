import { Conversation } from '@/types/chat';

export interface ChatbarInitialState {
  apiKeys: any;
  searchTerm: string;
  filteredConversations: Conversation[];
}

export const initialState: ChatbarInitialState = {
  apiKeys: {
    openai: '',
    anthropic: '',
    mistral: '',
    gemini: '',
  },
  searchTerm: '',
  filteredConversations: [],
};
