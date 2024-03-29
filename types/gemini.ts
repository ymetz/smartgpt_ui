export interface GeminiModel {
    id: string;
    name: string;
    maxLength: number; // maximum length of a message
    tokenLimit: number;
  }
  
  export enum GeminiModelID {
    GEMINI_PRO_1_0 = 'gemini-pro',
    GEMINI_PRO_1_5 = 'gemini-1.5-pro-latest',
  }
  
  // in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
  export const fallbackModelID = GeminiModelID.GEMINI_PRO_1_0;
  
  export const GeminiModels: Record<GeminiModelID, GeminiModel> = {
    [GeminiModelID.GEMINI_PRO_1_0]: {
      id: GeminiModelID.GEMINI_PRO_1_0,
      name: 'Gemini Pro 1.0',
      maxLength: 30720,
      tokenLimit: 2048,
    },
    [GeminiModelID.GEMINI_PRO_1_5]: {
      id: GeminiModelID.GEMINI_PRO_1_5,
      name: 'Gemini Pro 1.5',
      maxLength: 1048576,
      tokenLimit: 8192,
    },
  };
  