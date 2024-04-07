import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { Conversation } from '@/types/chat';

import { PromptbarInitialState } from './Promptbar.state';

export interface PromptbarContextProps {
  state: PromptbarInitialState;
  dispatch: Dispatch<ActionType<PromptbarInitialState>>;
  handleCreateTemplate: () => void;
  handleDeleteTemplate: (prompt: Conversation) => void;
  handleUpdateTemplate: (prompt: Conversation) => void;
}

const PromptbarContext = createContext<PromptbarContextProps>(undefined!);

export default PromptbarContext;
