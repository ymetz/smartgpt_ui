/*
A Component showing imprint, disclaimer, faq and privacy policy.
*/
import React, { FC, useEffect, useRef } from 'react';

import { useTranslation } from 'next-i18next';

const Disclaimer = () => {
    const { t } = useTranslation('disclaimer');
    
    return (
        <div className="flex flex-col items-center space-y-4">
        <h1 className="text-2xl font-semibold">{t('Disclaimer')}</h1>
        <p>{t('This is a research prototype and is not intended for production use. The developers are not responsible for any damages or losses resulting from the use of this software.')}</p>
        </div>
    );
}

const FAQ = () => {
    const { t } = useTranslation('faq');
    
    return (
        <div className="flex flex-col items-center space-y-4">
        <h1 className="text-2xl font-semibold">{t('FAQ')}</h1>
        <p>{t('What is SmartGPT?')}</p>
        <p>{t('SmartGPT is a research prototype that uses GPT-3 to generate text based on user input.')}</p>
        <p>{t('How does SmartGPT work?')}</p>
        <p>{t('SmartGPT uses a multi-prompt approach.')}</p>
        <p>{t('Are my API keys and personal data safe?')}</p>
        <p>{t('Yes, SmartGPT does not store any API keys or personal data. Storage is done via your browsers local storage. We want to note that comes with its own risks (https://www.horangi.com/blog/misuse-of-local-storage). We are working on a better solution.')}</p>
        <p>{t('How can I contribute?')}</p>
        <p>{t('We plan to open contribution options.')}</p>
        </div>
    );
}

const ImprintNotice = () => {
    const { t } = useTranslation('imprint');
    
    return (
        <div className="flex flex-col items-center space-y-4">
        <h1 className="text-2xl font-semibold">{t('Imprint')}</h1>
        <p>{t('This website is operated by SmartGPT Inc.')}</p>
        </div>
    );
}

const PrivacyPolicy = () => {
    const { t } = useTranslation('privacy-policy');
    
    return (
        <div className="flex flex-col items-center space-y-4">
        <h1 className="text-2xl font-semibold">{t('Privacy Policy')}</h1>
        <p>{t('We do not collect any personal data on this website. No chats, api keys, folders or other personal data is saved by this website.')} </p>
        <p>{t('We are not responsible for any content or generations created with SmartGPT.')}</p>
        </div>
    );
}

interface Props {
    open: boolean;
    onClose: () => void;
  }
  
export const Imprint: FC<Props> = ({ open, onClose }) => {

    const modalRef = useRef<HTMLDivElement>(null);

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

    if (!open) {
        return <></>;
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
              className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#212F3C] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
              role="dialog"
            >
        <div className="flex flex-col items-center space-y-4">
            <Disclaimer />
            <FAQ />
            <ImprintNotice /> {/* Fix component name reference */}
            <PrivacyPolicy />
        </div>
        </div>
        </div>
        </div>
        </div>

    );
}

