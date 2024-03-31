import { AnthropicModelID } from '@/types/anthropic';
import { Conversation, Message } from '@/types/chat';
import { ErrorMessage } from '@/types/error';
import { FolderInterface } from '@/types/folder';
import { OpenAIModel, OpenAIModelID } from '@/types/openai';
import { PluginKey, ApiKeys, Providers } from '@/types/plugin';
import { Prompt } from '@/types/prompt';
import { Template } from '@/types/template';

export interface HomeInitialState {
  apiKeys: ApiKeys;
  pluginKeys: PluginKey[];
  loading: boolean;
  lightMode: 'light' | 'dark';
  messageIsStreaming: boolean;
  modelError: ErrorMessage | null;
  models: OpenAIModel[];
  folders: FolderInterface[];
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  currentMessage: Message | undefined;
  prompts: Prompt[];
  templates: Template[];
  promptMode: string;
  temperature: number;
  showChatbar: boolean;
  showPromptbar: boolean;
  currentFolder: FolderInterface | undefined;
  messageError: boolean;
  searchTerm: string;
  defaultModelId: OpenAIModelID | AnthropicModelID | undefined;
}

export const initialState: HomeInitialState = {
  apiKeys: {
    [Providers.OPENAI]: '',
    [Providers.ANTHROPIC]: '',
    [Providers.MISTRAL]: '',
    [Providers.GEMINI]: '',
  },
  loading: false,
  pluginKeys: [],
  lightMode: 'dark',
  messageIsStreaming: false,
  modelError: null,
  models: [],
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  prompts: [],
  templates: [],
  temperature: 1,
  promptMode: 'smartgpt',
  showPromptbar: true,
  showChatbar: true,
  currentFolder: undefined,
  messageError: false,
  searchTerm: '',
  defaultModelId: undefined,
};
