import { KeyValuePair } from './data';

import { DEFAULT_ASSISTANT_PROMPT, DEFAULT_RESEARCHER_PROMPT, DEFAULT_RESOLVER_PROMPT , DEFAULT_SMART_GPT_NUM_ASKS } from '@/utils/app/const';

export interface Plugin {
  id: PluginID;
  name: PluginName;
  requiredKeys: KeyValuePair[];
  additionalOptions?: PluginOption[];
}DEFAULT_RESOLVER_PROMPT

export interface PluginOption {
  key: string;
  name: string;
  value: string | number | boolean; // optional, value should be read from env var
  type: DataType;
}

export enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
}

export interface PluginKey {
  pluginId: PluginID;
  requiredKeys: KeyValuePair[];
}

export enum PluginID {
  SMART_GPT = 'smartgpt',
  //TREE_OF_THOUGHTs = 'tree-of-thoughts',
}

export enum PluginName {
  SMART_GPT = 'SmartGPT',
  //TREE_OF_THOUGHTs = 'Tree of Thoughts',
}

export const Plugins: Record<PluginID, Plugin> = {
  [PluginID.SMART_GPT]: {
    id: PluginID.SMART_GPT,
    name: PluginName.SMART_GPT,
    requiredKeys: [],
    additionalOptions: [{
      key: 'SMART_GPT_NUM_ASKS',
      name: 'Number of Asks',
      value: DEFAULT_SMART_GPT_NUM_ASKS,
      type: DataType.NUMBER,
    },
  {
      key: 'SMARTGPT_ASSISTANT_PROMPT',
      name: 'Assistant Prompt',
      value: DEFAULT_ASSISTANT_PROMPT,
      type: DataType.STRING,
    },
  {
    key: 'SMARTGPT_RESEARCHER_PROMPT',
    name: 'Researcher Prompt',
    value: DEFAULT_RESEARCHER_PROMPT,
    type: DataType.STRING,
  },
  {
    key: 'SMARTGPT_RESOLVER_PROMPT',
    name: 'Resolver Prompt',
    value: DEFAULT_RESOLVER_PROMPT,
    type: DataType.STRING,
  }
  ]
  },
  /*[PluginID.TREE_OF_THOUGHTs]: {
    id: PluginID.TREE_OF_THOUGHTs,
    name: PluginName.TREE_OF_THOUGHTs,
    requiredKeys: [],  },*/
};

/* Add "Default" as a further option, to create a "FullPluginList" */
export const FullPluginList = [{
  id: 'default' as PluginID,
  name: 'Default' as PluginName,
  requiredKeys: [],
} as Plugin].concat(Object.values(Plugins));

export const PluginList = Object.values(Plugins);
