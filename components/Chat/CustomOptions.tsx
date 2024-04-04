import { FC, useContext, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { DEFAULT_PROMPT_MODE } from '@/utils/app/const';

import { FullPluginList, Plugin, PluginOption } from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';

interface Props {
  label: string;
  promptMode: string;
  onChangeOption: (onChangeOption: PluginOption[]) => void;
}

export const CustomOptions: FC<Props> = ({
  label,
  promptMode,
  onChangeOption,
}) => {
  const {
    state: { conversations, models, selectedConversation },
  } = useContext(HomeContext);
  const lastConversation = conversations[conversations.length - 1];
  const [options, setOptions] = useState(lastConversation?.options ?? []);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [followupModel, setFollowupModel] = useState<string>(
    selectedConversation?.model?.id || models[0].id,
  );

  useEffect(() => {
    if (promptMode === 'default') {
      setOptions([]);
    } else {
      const plugin = FullPluginList.find((plugin) => plugin.id === promptMode);

      setOptions(plugin?.additionalOptions ?? []);
    }
  }, [promptMode]);

  useEffect(() => {
    if (selectedConversation?.options) {
      setOptions(selectedConversation?.options);
    } else {
      if (promptMode === 'default') {
        setOptions([]);
      } else {
        const plugin = FullPluginList.find((plugin) => plugin.id === promptMode);
  
        setOptions(plugin?.additionalOptions ?? []);
      }
    }
  }, [selectedConversation]);

  const getInputField = (option: PluginOption) => {
    if (option.key === 'SMARTGPT_FOLLOWUP_MODEL') {
      return (
        <select
          className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-3 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
          style={{
            bottom: `20px`,
            maxHeight: '450px',
          }}
          value={followupModel}
          onChange={(e) => {
            const newOptions = options.map((o) => {
              if (o.name === option.name) {
                return {
                  ...o,
                  value: e.target.value,
                };
              }
              return o;
            });
            setFollowupModel(e.target.value);
            setOptions(newOptions);
            onChangeOption(newOptions);
          }}
        >
          {models.map((model) => (
            <option
              key={model.id}
              value={model.id}
              className="dark:bg-[#343541] dark:text-white"
            >
              {model.name}
            </option>
          ))}
        </select>
      );
    } else if (option.type === 'string') {
      return (
        <textarea
          className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-3 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
          style={{
            bottom: `20px`,
            maxHeight: '450px',
          }}
          rows={4}
          value={option.value as string}
          onChange={(e) => {
            const newOptions = options.map((o) => {
              if (o.name === option.name) {
                return {
                  ...o,
                  value: e.target.value,
                };
              }
              return o;
            });
            setOptions(newOptions);
            onChangeOption(newOptions);
          }}
        />
      );
    } else if (option.type === 'number') {
      return (
        <input
          className="w-full rounded-lg border border-neutral-200 bg-transparent px-8 py-3 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
          style={{
            resize: 'none',
            bottom: `20px`,
            overflow: `auto`,
          }}
          type="number"
          min={1}
          max={10}
          value={option.value as number}
          onChange={(e) => {
            const newOptions = options.map((o) => {
              if (o.name === option.name) {
                return {
                  ...o,
                  value: e.target.value,
                };
              }
              return o;
            });
            setOptions(newOptions);
            onChangeOption(newOptions);
          }}
        />
      );
    } else if (option.type === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={option.value as boolean}
          onChange={(e) => {
            const newOptions = options.map((o) => {
              if (o.name === option.name) {
                return {
                  ...o,
                  value: e.target.checked,
                };
              }
              return o;
            });
            setOptions(newOptions);
            onChangeOption(newOptions);
          }}
        />
      );
    }
  };

  // For the extra options, add addition input fields, e.g. text areas for strings, number inputs for numbers, etc.
  return (
    <>
      <button
        type="button"
        onClick={() => setOptionsVisible(!optionsVisible)}
        className="select-none rounded-lg bg-gray-900 px-6 py-3 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
      >
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
        Show {label}
      </button>
      <div
        className={`transition-all overflow-hidden duration-300 ease-in-out ${
          optionsVisible ? 'block' : 'hidden'
        }`}
      >
        <div className="flex flex-col">
          <div className="flex flex-col justify-between">
            {options.map((option) => (
              <div key={option.name}>
                <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
                  {option.name}
                </label>
                {getInputField(option)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
