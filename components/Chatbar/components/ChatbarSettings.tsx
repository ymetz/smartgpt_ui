import {
  IconFileExport,
  IconInfoCircle,
  IconQuestionMark,
  IconSettings,
} from '@tabler/icons-react';
import { Provider, useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { Providers } from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';

import { Imprint } from '@/components/Imprint/Imprint';
import { SettingDialog } from '@/components/Settings/SettingDialog';

import { Import } from '../../Settings/Import';
import { Key } from '../../Settings/Key';
import { SidebarButton } from '../../Sidebar/SidebarButton';
import ChatbarContext from '../Chatbar.context';
import { ClearConversations } from './ClearConversations';
import { PluginKeys } from './PluginKeys';

export const ChatbarSettings = () => {
  const { t } = useTranslation('sidebar');
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);
  const [isImprintDialogOpen, setIsImprintDialog] = useState<boolean>(false);

  const {
    state: { apiKeys, lightMode, conversations },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const {
    handleClearConversations,
    handleImportConversations,
    handleExportData,
    handleApiKeyChange,
  } = useContext(ChatbarContext);

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null}

      <Import onImport={handleImportConversations} />

      <SidebarButton
        text={t('Export data')}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportData()}
      />

      <SidebarButton
        text={t('Settings')}
        icon={<IconSettings size={18} />}
        onClick={() => setIsSettingDialog(true)}
      />

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
        </>
      )}

      {/*<PluginKeys />*/}

      <SidebarButton
        text={t('Info & FAQ')}
        icon={<IconInfoCircle size={18} />}
        onClick={() => setIsImprintDialog(true)}
      />

      <Imprint
        open={isImprintDialogOpen}
        onClose={() => {
          setIsImprintDialog(false);
        }}
      />

      <SettingDialog
        open={isSettingDialogOpen}
        onClose={() => {
          setIsSettingDialog(false);
        }}
      />
    </div>
  );
};
