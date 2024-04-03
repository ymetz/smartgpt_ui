import { Conversation } from '@/types/chat';

export interface PromptbarInitialState {
  searchTerm: string;
  filteredTemplates: Conversation[];
}

export const initialState: PromptbarInitialState = {
  searchTerm: '',
  filteredTemplates: [],
};
