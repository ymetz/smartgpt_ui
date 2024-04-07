import { useContext } from 'react';

import { FolderInterface } from '@/types/folder';

import HomeContext from '@/pages/api/home/home.context';

import Folder from '@/components/Folder';
import { PromptComponent } from '@/components/Promptbar/components/Prompt';

import PromptbarContext from '../PromptBar.context';

export const PromptFolders = () => {
  const {
    state: { folders },
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredTemplates },
    handleUpdateTemplate,
  } = useContext(PromptbarContext);

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const prompt = JSON.parse(e.dataTransfer.getData('template'));

      const updatedTemplate = {
        ...prompt,
        folderId: folder.id,
      };

      handleUpdateTemplate(updatedTemplate);
    }
  };

  const PromptFolders = (currentFolder: FolderInterface) =>
  filteredTemplates
      .filter((p) => p.folderId)
      .map((template, index) => {
        if (template.folderId === currentFolder.id) {
          return (
            <div key={index} className="ml-5 gap-2 border-l pl-2">
              <PromptComponent template={template} />
            </div>
          );
        }
      });

  return (
    <div className="flex w-full flex-col pt-2">
      {folders
        .filter((folder) => folder.type === 'prompt')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder, index) => (
          <Folder
            key={index}
            searchTerm={searchTerm}
            currentFolder={folder}
            handleDrop={handleDrop}
            folderComponent={PromptFolders(folder)}
          />
        ))}
    </div>
  );
};
