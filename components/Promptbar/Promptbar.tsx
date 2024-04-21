import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { saveTemplates } from '@/utils/app/prompts';

import { AllModels } from '@/types/allModels';

import HomeContext from '@/pages/api/home/home.context';

import { PromptFolders } from './components/PromptFolders';
import { Prompts } from './components/Prompts';

import Sidebar from '../Sidebar';
import PromptbarContext from './PromptBar.context';
import { PromptbarInitialState, initialState } from './Promptbar.state';

import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '@/types/chat';

const Promptbar = () => {
  const { t } = useTranslation('promptbar');

  const promptBarContextValue = useCreateReducer<PromptbarInitialState>({
    initialState,
  });

  const {
    state: { savedTemplates, defaultModelId, showPromptbar, selectedConversation },
    dispatch: homeDispatch,
    handleCreateFolder,
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredTemplates },
    dispatch: promptDispatch,
  } = promptBarContextValue;

  const handleTogglePromptbar = () => {
    homeDispatch({ field: 'showPromptbar', value: !showPromptbar });
    localStorage.setItem('showPromptbar', JSON.stringify(!showPromptbar));
  };

  const handleCreateTemplate = () => {
    if (defaultModelId) {
      // copy values of selected conversation to new template
      const newTemplate: Conversation = {
        id: uuidv4() + selectedConversation?.id,
        name: `Template ${savedTemplates.length + 1}`,
        model: selectedConversation?.model || AllModels[defaultModelId],
        messages: [],
        promptMode: selectedConversation?.promptMode || 'smartgpt',
        temperature: selectedConversation?.temperature || 1,
        options: selectedConversation?.options,
        folderId: '',
        prompt: selectedConversation?.prompt || '',
      };

      const updatedTemplates = [...savedTemplates, newTemplate];

      homeDispatch({ field: 'savedTemplates', value: updatedTemplates });

      saveTemplates(updatedTemplates);
    }
  };

  const handleDeleteTemplate = (template: Conversation) => {
    const updatedTemplates = savedTemplates.filter((p) => p.id !== template.id);

    homeDispatch({ field: 'savedTemplates', value: updatedTemplates });
    saveTemplates(updatedTemplates);
  };

  const handleUpdateTemplate = (template: Conversation) => {
    const updatedTemplates = savedTemplates.map((p) => {
      if (p.id === template.id) {
        return template;
      }

      return p;
    });
    homeDispatch({ field: 'savedTemplates', value: updatedTemplates });

    saveTemplates(updatedTemplates);
  };

  const InfoText = () => {
    return (
      <div className="flex flex-col justify-between h-fit mt-10">
        <div className="flex flex-col">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('Add templates for prompt modes here')}
          </p>
        </div>
      </div>
    );
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const prompt = JSON.parse(e.dataTransfer.getData('prompt'));

      const updatedPrompt = {
        ...prompt,
        folderId: e.target.dataset.folderId,
      };

      handleUpdateTemplate(updatedPrompt);

      e.target.style.background = 'none';
    }
  };

  useEffect(() => {
    if (searchTerm) {
      promptDispatch({
        field: 'filteredTemplates',
        value: savedTemplates.filter((template) => {
          const searchable = template.name.toLowerCase();
          return searchable.includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      promptDispatch({ field: 'filteredTemplates', value: savedTemplates });
    }
  }, [searchTerm, savedTemplates]);

  return (
    <PromptbarContext.Provider
      value={{
        ...promptBarContextValue,
        handleCreateTemplate,
        handleDeleteTemplate,
        handleUpdateTemplate,
      }}
    >
      <Sidebar<Conversation>
        side={'right'}
        isOpen={showPromptbar}
        addItemButtonTitle={t('Save From Current')}
        itemComponent={
          <Prompts
            templates={filteredTemplates.filter((prompt) => !prompt.folderId)}
          />
        }
        folderComponent={<PromptFolders />}
        items={filteredTemplates}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          promptDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleTogglePromptbar}
        handleCreateItem={handleCreateTemplate}
        handleCreateFolder={() => handleCreateFolder(t('New folder'), 'prompt')}
        handleDrop={handleDrop}
        footerComponent={<InfoText />}
      />
    </PromptbarContext.Provider>
  );
};

export default Promptbar;
