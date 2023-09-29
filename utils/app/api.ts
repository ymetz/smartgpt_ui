import { Plugin, PluginID } from '@/types/plugin';

export const getEndpoint = (plugin: Plugin | null) => {
  if (!plugin) {
    return 'api/chat';
  }

  if (plugin.id === PluginID.GOOGLE_SEARCH) {
    return 'api/google';
  }

  if (plugin.id === PluginID.SMART_GPT) {
    return 'api/smartgpt';
  }

  if (plugin.id === PluginID.CONGRESS_GPT) {
    return 'api/congressgpt';
  }

  return 'api/chat';
};
