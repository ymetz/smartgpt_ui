export interface AnthropicModel {
  id: string;
  name: string;
  maxLength: number; // maximum length of a message
  tokenLimit: number;
}

export enum AnthropicModelID {
  CALUDE_3_OPUS = 'claude-3-opus-20240229',
  CLAUDE_3_SONNET = 'claude-3-sonnet-20240229',
  CLAUDE_3_HAIKU = 'claude-3-haiku-20240307',
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = AnthropicModelID.CLAUDE_3_SONNET;

export const AnthropicModels: Record<AnthropicModelID, AnthropicModel> = {
  [AnthropicModelID.CALUDE_3_OPUS]: {
    id: AnthropicModelID.CALUDE_3_OPUS,
    name: 'Claude 3 Opus',
    maxLength: 200000,
    tokenLimit: 4096,
  },
  [AnthropicModelID.CLAUDE_3_SONNET]: {
    id: AnthropicModelID.CLAUDE_3_SONNET,
    name: 'Claude 3 Sonnet',
    maxLength: 200000,
    tokenLimit: 4096,
  },
  [AnthropicModelID.CLAUDE_3_HAIKU]: {
    id: AnthropicModelID.CLAUDE_3_HAIKU,
    name: 'Claude 3 Haiku',
    maxLength: 200000,
    tokenLimit: 4096,
  },
};
