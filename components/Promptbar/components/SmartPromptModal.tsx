import { IconPlus } from '@tabler/icons-react';
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { Conversation, Message } from '@/types/chat';
import { SystemPrompt } from '@/components/Chat/SystemPrompt';
import { DataType } from '@/types/plugin';

interface Props {
  template: Conversation;
  onClose: () => void;
  onUpdateTemplate: (prompt: Conversation) => void;
}

export const SmartPromptModal: FC<Props> = ({
  template,
  onClose,
  onUpdateTemplate,
}) => {
  const { t } = useTranslation('promptbar');
  const [name, setName] = useState(template.name);
  const [SystemPrompt, setSystemPrompts] = useState(template.prompt);
  const [numInitialPrompts, setNumInitialPrompts] = useState(3);  
  const [assistantPrompt, setAssistantPrompt] = useState(template.options?.find(option => option.key === "SMARTGPT_ASSISTANT_PROMPT")?.value as string);
  const [researcherPrompt, setResearcherPrompt] = useState(template.options?.find(option => option.key === "SMARTGPT_RESEARCHER_PROMPT")?.value as string);
  const [resolverPrompt, setResolverPrompt] = useState(template.options?.find(option => option.key === "SMARTGPT_RESOLVER_PROMPT")?.value as string);


  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleEnter = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      //onUpdateTemplate({ ...template, name, options: { ...template.options } });
      onClose();
    }
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      window.removeEventListener('mouseup', handleMouseUp);
      onClose();
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onKeyDown={handleEnter}
    >
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            ref={modalRef}
            className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#212F3C] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
            <div className="text-sm font-bold text-black dark:text-neutral-200">
              {t('Name')}
            </div>
            <input
              ref={nameInputRef}
              className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
              placeholder={t('A name for your prompt.') || ''}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
              {t('System Prompt')}
            </div>
            <textarea
              className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
              placeholder={t('System Prompt') || ''}
              value={SystemPrompt}
              onChange={(e) => setSystemPrompts(e.target.value)}
              rows={4}
            />

            <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
              {t('Number of Asks')}
            </div>
            <div className="flex gap-4 items-center">
            <input
              className="w-full rounded-lg border border-neutral-200 bg-transparent px-8 py-3 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
              style={{
                resize: 'none',
                bottom: `20px`,
                overflow: `auto`,
              }}
              type="number"
              value={numInitialPrompts as number}
              onChange={(e) => {
                setNumInitialPrompts(e.target.value as unknown as number);
              }
              }
            />
            </div>
            <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
              {t('Assistant Prompt')}
            </div>
            <textarea
              className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
              style={{ resize: 'none' }}
              placeholder={t('Assistant Prompt') || ''}
              value={assistantPrompt}
              onChange={(e) => setAssistantPrompt(e.target.value)}
              rows={4}
            />
            <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
              {t('Researcher Prompt')}
            </div>
            <textarea
              className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
              style={{ resize: 'none' }}
              placeholder={t('Researcher Prompt') || ''}
              value={researcherPrompt}
              onChange={(e) => setResearcherPrompt(e.target.value)}
              rows={4}
            />
            <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
              {t('Resolver Prompt')}
            </div>
            <textarea
              className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
              style={{ resize: 'none' }}
              placeholder={t('Resolver Prompt') || ''}
              value={resolverPrompt}
              onChange={(e) => setResolverPrompt(e.target.value)}
              rows={4}
            />
            <button
              type="button"
              className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
              onClick={() => {
                const updatedTemplate: Conversation = {
                  ...template,
                  name,
                  prompt: SystemPrompt,
                  messages: [],
                  options: [
                    {key: "SMARTGPT_ASSISTANT_PROMPT", value: assistantPrompt as string, name: "Assistant Prompt", type: DataType.STRING},
                    {key: "SMARTGPT_RESEARCHER_PROMPT", value: researcherPrompt as string, name: "Researcher Prompt", type: DataType.STRING},
                    {key: "SMARTGPT_RESOLVER_PROMPT", value: resolverPrompt as string, name: "Resolver Prompt", type: DataType.STRING},
                    {key: "SMART_GPT_NUM_ASKS", value: numInitialPrompts as number, name: "Number of Asks", type: DataType.NUMBER},
                  ]
                };
                onUpdateTemplate(updatedTemplate);
                onClose();
              }
              }
            >
              {t('Save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
