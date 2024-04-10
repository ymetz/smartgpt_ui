import { IconExternalLink } from '@tabler/icons-react';
import { useContext } from 'react';

import { useTranslation } from 'next-i18next';

import { AnthropicModel } from '@/types/anthropic';
import { OpenAIModel } from '@/types/openai';

import HomeContext from '@/pages/api/home/home.context';

export const ModelSelect = () => {
  const { t } = useTranslation('chat');

  const {
    state: { selectedConversation, models, defaultModelId },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectedConversation &&
      handleUpdateConversation(selectedConversation, {
        key: 'model',
        value: models.find((model) => model.id === e.target.value) as
          | OpenAIModel
          | AnthropicModel,
      });
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {t('Model')}
      </label>
      <div className="w-full rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full bg-transparent p-2"
          placeholder={t('Select a model') || ''}
          value={selectedConversation?.model?.id || defaultModelId}
          onChange={handleChange}
        >
          {models.map((model) => (
            <option
              key={model.id}
              value={model.id}
              className="dark:bg-[#343541] dark:text-white"
            >
              {model.id === defaultModelId
                ? `Default (${model.name})`
                : model.name}
            </option>
          ))}
        </select>
      </div>
      {
        // if an anthropic model and smartgpt prompt mode, show a warning box about rate limits 
        selectedConversation?.model?.id.includes('claude') &&
        selectedConversation?.promptMode === 'smartgpt' && (
          <div className="mt-2 bg-orange-100 bg-opacity-20 border-t-4 border-orange-300 rounded-b text-stone-200 px-4 py-3 shadow-md" role="alert">
            <div className="flex">
              <div className="py-1"><svg className="fill-current h-6 w-6 text-orange-300 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
              <div>
                <p className="font-bold">Warning: Claude Rate Limits</p>
                <p className="text-sm">You might run into rate limits when using Claude as the main model for SmartGPT. In this case, switch to OpenAI models.</p>
              </div>
            </div>
          </div>
        )
      }
      <div className="w-full mt-3 text-left text-neutral-700 dark:text-neutral-400 flex items-center">
        <a
          href="https://platform.openai.com/account/usage"
          target="_blank"
          className="flex items-center"
        >
          <IconExternalLink size={18} className={'inline mr-1'} />
          {t('View OpenAI Account Usage')}
        </a>
        <a
          href="https://console.anthropic.com/settings/usage"
          target="_blank"
          className="flex items-center ml-4"
        >
          <IconExternalLink size={18} className={'inline mr-1'} />
          {t('View Anthrophic Account Usage')}
        </a>
      </div>
    </div>
  );
};
