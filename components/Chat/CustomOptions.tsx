import { FC, useContext, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { DEFAULT_PROMPT_MODE } from '@/utils/app/const';

import { FullPluginList, PluginOption, Plugin } from '@/types/plugin';

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
        state: { conversations },
    } = useContext(HomeContext);
    const lastConversation = conversations[conversations.length - 1];
    const [options, setOptions] = useState(
        lastConversation?.options ?? [],
    );

    // set plugin from default mode
    useEffect(() => {
        if (promptMode === 'default') {
            setOptions([]);
        } else {
            const plugin = FullPluginList.find((plugin) => plugin.id === promptMode);

            setOptions(plugin?.additionalOptions ?? []);
        }
    }, [promptMode]);

    const getInputField = (option: PluginOption) => {
        if (option.type === 'string') {
            return (
                <textarea
                    className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-3 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
                    style={{
                    resize: 'none',
                    bottom: `20px`,
                    maxHeight: '300px',
                    overflow: `auto`,
                    }}
                    value={option.value}
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
                    value={option.value}
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
                    checked={option.value}
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
        <div className="flex flex-col">
            <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
                {label}
            </label>
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
    )
};
