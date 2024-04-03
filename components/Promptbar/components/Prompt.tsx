import {
  IconBulbFilled,
  IconCheck,
  IconEdit,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  DragEvent,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Conversation } from '@/types/chat';

import HomeContext from '@/pages/api/home/home.context';

import SidebarActionButton from '@/components/Buttons/SidebarActionButton';

import PromptbarContext from '../PromptBar.context';
import { PromptModal } from './PromptModal';
import { SmartPromptModal } from './SmartPromptModal';

interface Props {
  template: Conversation;
}

export const PromptComponent = ({ template }: Props) => {
  const {
    dispatch: promptDispatch,
    handleUpdateTemplate,
    handleDeleteTemplate,
  } = useContext(PromptbarContext);
  const { promptMode } = useContext(HomeContext).state;
  const { handleSelectConversation } = useContext(HomeContext);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const handleUpdate = (template: Conversation) => {
    handleUpdateTemplate(template);
    promptDispatch({ field: 'searchTerm', value: '' });
  };

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (isDeleting) {
      handleDeleteTemplate(template);
      promptDispatch({ field: 'searchTerm', value: '' });
    }

    setIsDeleting(false);
  };

  const handleCancelDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(false);
  };

  const handleOpenDeleteModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(true);
  };

  const handleDragStart = (e: DragEvent<HTMLButtonElement>, template: Conversation) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('template', JSON.stringify(template));
    }
  };

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  return (
    <div className="relative flex items-center">
      <button
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#343541]/90"
        draggable="true"
        onClick={(e) => {
          handleSelectConversation(template);
          e.stopPropagation();
        }}
        onDragStart={(e) => handleDragStart(e, template)}
        onMouseLeave={() => {
          setIsDeleting(false);
          setIsRenaming(false);
          setRenameValue('');
        }}
      >
        
        <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all pr-4 text-left text-[12.5px] leading-3">
          {template.name}
        </div>
      </button>

      {(isDeleting || isRenaming) && (
        <div className="absolute right-1 z-10 flex text-gray-300">
          <SidebarActionButton handleClick={() => setShowModal(true)}>
            <IconEdit size={18} className="text-gray-300" />
          </SidebarActionButton>
          
          <SidebarActionButton handleClick={handleDelete}>
            <IconCheck size={18} />
          </SidebarActionButton>

          <SidebarActionButton handleClick={handleCancelDelete}>
            <IconX size={18} />
          </SidebarActionButton>
        </div>
      )}

      {!isDeleting && !isRenaming && (
        <div className="absolute right-1 z-10 flex text-gray-300">
          <SidebarActionButton handleClick={() => setShowModal(true)}>
            <IconEdit size={18} className="text-gray-300" />
          </SidebarActionButton>
          
          <SidebarActionButton handleClick={handleOpenDeleteModal}>
            <IconTrash size={18} />
          </SidebarActionButton>
        </div>
      )}

      {showModal &&
        (promptMode === 'smartgpt' ? (
          <SmartPromptModal
            template={template}
            onClose={() => setShowModal(false)}
            onUpdateTemplate={handleUpdate}
          />
        ) : (
          null
          /*<PromptModal
            template={template}
            onClose={() => setShowModal(false)}
            onUpdateTemplate={handleUpdate}
          />*/
        ))}
    </div>
  );
};
