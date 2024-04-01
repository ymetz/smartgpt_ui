import { FC, useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { DEFAULT_TEMPERATURE } from '@/utils/app/const';

import HomeContext from '@/pages/api/home/home.context';

interface Props {
  label: string;
  onChangeTemperature: (temperature: number) => void;
}

export const TemperatureSlider: FC<Props> = ({
  label,
  onChangeTemperature,
}) => {
  const {
    state: { conversations },
  } = useContext(HomeContext);
  const lastConversation = conversations[conversations.length - 1];
  const [temperature, setTemperature] = useState(
    lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
  );
  const [optionsVisible, setOptionsVisible] = useState(false);
  const { t } = useTranslation('chat');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setTemperature(newValue);
    onChangeTemperature(newValue);
  };

  return (
    <div>
            <label 
      onClick={() => setOptionsVisible(!optionsVisible)}
      className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
      <span className="mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 inline-block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
        {label}
      </label>
    <div className={`flex flex-col transition-all overflow-hidden duration-300 ease-in-out ${
          optionsVisible ? 'block' : 'hidden'
        }`}>
        <span className="mt-3 text-[12px] text-black/50 dark:text-white/50 text-sm">
          {t(
            'Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.',
          )}
        </span>
        <span className="mt-2 mb-1 text-center text-neutral-900 dark:text-neutral-100">
          {temperature.toFixed(1)}
        </span>
        <input
          className="cursor-pointer"
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={temperature}
          onChange={handleChange}
        />
        <ul className="w mt-2 pb-8 flex justify-between px-[24px] text-neutral-900 dark:text-neutral-100">
          <li className="flex justify-center">
            <span className="">{t('Precise')}</span>
          </li>
          <li className="flex justify-center">
            <span className="">{t('Neutral')}</span>
          </li>
          <li className="flex justify-center">
            <span className="">{t('Creative')}</span>
          </li>
        </ul>
      </div>
      </div>
  );
};
