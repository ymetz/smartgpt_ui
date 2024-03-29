export interface MistralModel {
    id: string;
    name: string;
    maxLength: number; // maximum length of a message
    tokenLimit: number;
  }
  
  export enum MistralModelID {
    MISTRAL_TINY = 'mistral-tiny-latest',
    MISTRAL_SMALL = 'mistral-small-latest',
    MISTRAL_MEDIUM = 'mistral-medium-latest',
    MISTRAL_LARGE = 'mistral-large-latest',
  }
  
  // in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
  export const fallbackModelID = MistralModelID.MISTRAL_SMALL;
  
  export const MistralModels: Record<MistralModelID, MistralModel> = {
    [MistralModelID.MISTRAL_TINY]: {
      id: MistralModelID.MISTRAL_TINY,
      name: 'Mistral Tiny',
      maxLength: 2000,
      tokenLimit: 4096,
    },
    [MistralModelID.MISTRAL_SMALL]: {
      id: MistralModelID.MISTRAL_SMALL,
      name: 'Mistral Small',
      maxLength: 2000,
      tokenLimit: 4096,
    },
    [MistralModelID.MISTRAL_MEDIUM]: {
      id: MistralModelID.MISTRAL_MEDIUM,
      name: 'Mistral Medium',
      maxLength: 2000,
      tokenLimit: 4096,
    },
    [MistralModelID.MISTRAL_LARGE]: {
      id: MistralModelID.MISTRAL_LARGE,
      name: 'Mistral Large',
      maxLength: 2000,
      tokenLimit: 4096,
    }
  };
  