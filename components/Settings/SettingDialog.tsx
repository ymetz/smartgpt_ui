import {FC, useContext, useEffect, useRef} from 'react';
import {useTranslation} from 'next-i18next';
import {useCreateReducer} from '@/hooks/useCreateReducer';
import {getSettings, saveSettings} from '@/utils/app/settings';
import {Settings} from '@/types/settings';
import HomeContext from '@/pages/api/home/home.context';
import {Key} from '@/components/Settings/Key';
import ChatbarContext from '@/components/Chatbar/Chatbar.context';
import {Providers} from "@/types/providers";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SettingDialog: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation('settings');
  const settings: Settings = getSettings();
  const { state, dispatch } = useCreateReducer<Settings>({
    initialState: settings,
  });
  const { dispatch: homeDispatch } = useContext(HomeContext);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    state: { apiKeys },
  } = useContext(HomeContext);

  const { handleApiKeyChange } = useContext(ChatbarContext);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mouseup', handleMouseUp);
      onClose();
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  const handleSave = () => {
    homeDispatch({ field: 'lightMode', value: state.theme });
    saveSettings(state);
  };

  if (!open) {
    return null;
  }

  return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="fixed inset-0 z-10 overflow-hidden">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
                className="hidden sm:inline-block sm:h-screen sm:align-middle"
                aria-hidden="true"
            />

            <div
                ref={modalRef}
                className="inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('Settings')}
              </h2>

              <div className="mb-6">
                <label
                    htmlFor="theme"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('Theme')}
                </label>
                <select
                    id="theme"
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    value={state.theme}
                    onChange={(event) =>
                        dispatch({ field: 'theme', value: event.target.value })
                    }
                >
                  <option value="dark">{t('Dark mode')}</option>
                  <option value="light">{t('Light mode')}</option>
                </select>
              </div>

              {apiKeys && (
                  <>
                    <Key
                        modelName="OpenAI API Key"
                        provider="openai"
                        apiKey={apiKeys[Providers.OPENAI]}
                        onApiKeyChange={(apiKey: string) =>
                            handleApiKeyChange(Providers.OPENAI, apiKey)
                        }
                    />
                    <Key
                        modelName="Anthropic API Key"
                        provider="anthropic"
                        apiKey={apiKeys[Providers.ANTHROPIC] || ''}
                        onApiKeyChange={(apiKey: string) =>
                            handleApiKeyChange(Providers.ANTHROPIC, apiKey)
                        }
                    />
                    <Key
                        modelName="Groq API Key"
                        provider="groq"
                        apiKey={apiKeys[Providers.GROQ] || ''}
                        onApiKeyChange={(apiKey: string) =>
                            handleApiKeyChange(Providers.GROQ, apiKey)
                        }
                    />
                  </>
              )}

              <div className="mt-8 flex justify-end space-x-4">
                <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    onClick={onClose}
                >
                  {t('Cancel')}
                </button>
                <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => {
                      handleSave();
                      onClose();
                    }}
                >
                  {t('Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
