import { FC, useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { DEFAULT_PROMPT_MODE } from '@/utils/app/const';

import { FullPluginList } from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';

interface Props {
  label: string;
  onChangeMode: (promptMode: string) => void;
}

const styleActiveButton =
  'px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75';
const styleInactiveButton =
  'px-4 py-2 rounded-md text-sm font-medium text-blue-500 bg-gray-800 hover:bg-black-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75';

export const ModeSelect: FC<Props> = ({ label, onChangeMode }) => {
  const {
    state: { conversations },
  } = useContext(HomeContext);
  const lastConversation = conversations[conversations.length - 1];
  const [mode, setMode] = useState(
    lastConversation?.promptMode ?? DEFAULT_PROMPT_MODE,
  );
  const { t } = useTranslation('chat');
  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newValue = event.currentTarget.value;
    setMode(newValue);
    onChangeMode(newValue);
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {label}
      </label>
      <div className="flex flex-row justify-center px-4 m-2">
        {FullPluginList.map((plugin) => (
          <button
            onClick={handleChange}
            key={plugin.id}
            value={plugin.id}
            className={
              mode === plugin.id ? styleActiveButton : styleInactiveButton
            }
            style={{ marginInline: '0.5rem' }}
          >
            {plugin.name}
          </button>
        ))}
      </div>
    </div>
  );
};
