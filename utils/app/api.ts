import { Plugin, PluginID } from '@/types/plugin';

export const getEndpoint = (plugin: Plugin | null) => {
  if (!plugin) {
    return 'api/chat';
  }

  if (plugin.id === PluginID.SMART_GPT) {
    return 'api/smartgpt';
  }

  return 'api/chat';
};
