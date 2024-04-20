import {BaseModel} from "@/types/BaseModel";

export enum GroqModelID {
  LLAMA_3_8B = 'llama3-8b-8192',
  LLAMA_3_70B = 'llama3-70b-8192',
  MIXTRAL_8x7B = 'mixtral-8x7b-32768',
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = GroqModelID.LLAMA_3_8B;

export const GroqModels: Record<GroqModelID, BaseModel> = {
  [GroqModelID.LLAMA_3_8B]: {
    id: GroqModelID.LLAMA_3_8B,
    name: 'LLama3 8B @Groq',
    maxLength: 12000,
    tokenLimit: 8192,
  },
  [GroqModelID.LLAMA_3_70B]: {
    id: GroqModelID.LLAMA_3_70B,
    name: 'LLama3 70B @Groq',
    maxLength: 12000,
    tokenLimit: 8192,
  },
  [GroqModelID.MIXTRAL_8x7B]: {
    id: GroqModelID.MIXTRAL_8x7B,
    name: 'Mixtral 8x7B @Groq',
    maxLength: 12000,
    tokenLimit: 32768,
  },
};
