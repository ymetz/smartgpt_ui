import {IconClearAll, IconSettings} from '@tabler/icons-react';
import {memo, MutableRefObject, useCallback, useContext, useEffect, useRef, useState,} from 'react';
import toast from 'react-hot-toast';

import {useTranslation} from 'next-i18next';

import {getEndpoint} from '@/utils/app/api';
import {saveConversation, saveConversations,} from '@/utils/app/conversation';
import {throttle} from '@/utils/data/throttle';

import {ChatBody, Conversation, Message} from '@/types/chat';
import {atLeastOneApiKeySet, Plugin, PluginOption} from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';

import Spinner from '../Spinner';
import {ChatInput} from './ChatInput';
import {ChatLoader} from './ChatLoader';
import {CustomOptions} from './CustomOptions';
import {ErrorMessageDiv} from './ErrorMessageDiv';
import {MemoizedChatMessage} from './MemoizedChatMessage';
import {ModeSelect} from './ModeSelect';
import {ModelSelect} from './ModelSelect';
import {SystemPrompt} from './SystemPrompt';
import {TemperatureSlider} from './Temperature';

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

export const Chat = memo(({ stopConversationRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectedConversation,
      conversations,
      models,
      apiKeys,
      pluginKeys,
      messageIsStreaming,
      modelError,
      loading
    },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
      if (selectedConversation) {
        let updatedConversation: Conversation;
        if (deleteCount) {
          const updatedMessages = [...selectedConversation.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          updatedConversation = {
            ...selectedConversation,
            messages: [...updatedMessages, message],
          };
        } else {
          updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
          };
        }
        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
        homeDispatch({ field: 'loading', value: true });
        homeDispatch({ field: 'messageIsStreaming', value: true });
        const chatBody: ChatBody = {
          model: updatedConversation.model,
          messages: updatedConversation.messages,
          keys: apiKeys,
          prompt: updatedConversation.prompt,
          temperature: updatedConversation.temperature,
        };
        if (updatedConversation?.options) {
          chatBody.options = updatedConversation.options;
        }
        const endpoint = getEndpoint(plugin);
        let body;
        body = JSON.stringify({
          ...chatBody,
        });
        const controller = new AbortController();
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body,
        });
        if (!response.ok) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          toast.error(response.statusText);
          return;
        }
        const data = response.body;
        if (!data) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          return;
        }
        if (updatedConversation.messages.length === 1) {
          const { content } = message;
          const customName =
            content.length > 30 ? content.substring(0, 30) + '...' : content;
          updatedConversation = {
            ...updatedConversation,
            name: customName,
          };
        }
        homeDispatch({ field: 'loading', value: false });
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let isFirst = true;
        let text = '';
        while (!done) {
          if (stopConversationRef.current === true) {
            controller.abort();
            done = true;
            break;
          }
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          text += chunkValue;
          if (isFirst) {
            isFirst = false;
            const updatedMessages: Message[] = [
              ...updatedConversation.messages,
              { role: 'assistant', content: chunkValue },
            ];
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };
            homeDispatch({
              field: 'selectedConversation',
              value: updatedConversation,
            });
          } else {
            const updatedMessages: Message[] =
              updatedConversation.messages.map((message, index) => {
                if (index === updatedConversation.messages.length - 1) {
                  return {
                    ...message,
                    content: text,
                  };
                }
                return message;
              });
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };
            homeDispatch({
              field: 'selectedConversation',
              value: updatedConversation,
            });
          }
        }
        saveConversation(updatedConversation);
        const updatedConversations: Conversation[] = conversations.map(
          (conversation) => {
            if (conversation.id === selectedConversation.id) {
              return updatedConversation;
            }
            return conversation;
          },
        );
        if (updatedConversations.length === 0) {
          updatedConversations.push(updatedConversation);
        }
        homeDispatch({ field: 'conversations', value: updatedConversations });
        saveConversations(updatedConversations);
        homeDispatch({ field: 'messageIsStreaming', value: false });
      }
    },
    [
      apiKeys,
      conversations,
      homeDispatch,
      selectedConversation,
      stopConversationRef,
    ],
  );

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onClearAll = () => {
    if (
      confirm(t<string>('Are you sure you want to clear all messages?')) &&
      selectedConversation
    ) {
      handleUpdateConversation(selectedConversation, {
        key: 'messages',
        value: [],
      });
    }
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  // useEffect(() => {
  //   console.log('currentMessage', currentMessage);
  //   if (currentMessage) {
  //     handleSend(currentMessage);
  //     homeDispatch({ field: 'currentMessage', value: undefined });
  //   }
  // }, [currentMessage]);

  useEffect(() => {
    throttledScrollDown();
    selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2],
      );
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  return (
    <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
      {!apiKeys || !atLeastOneApiKeySet(apiKeys) ? (

          <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-8 sm:w-[600px] p-8">
            <div className="text-center text-5xl font-bold text-black dark:text-white mb-4">
              🧠 SmartGPT
            </div>
            <div className="text-center text-xl text-black dark:text-white mb-8">
              <div className="mb-4">SmartGPT 2.0: Mixed Models, Better Reasoning.</div>
            </div>
            <div className="text-left text-gray-700 dark:text-gray-300 text-base">
              <div className="mb-6">
                SmartGPT is an improved version of default GPT variants integrating different prompting and in-context
                learning techniques.
              </div>
              <hr className="border-gray-300 dark:border-gray-600 mb-6"/>
              <div className="mb-6">
                <p>
                  To get started, please add your API key from{' '}
                  <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:underline"
                  >
                    OpenAI
                  </a>{' '}
                  and/or{' '}
                  <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:underline"
                  >
                    Anthropic
                  </a>{' '}
                  in the <strong>settings</strong> located at the bottom left of the application. If you have
                  never done this before, don't worry! It's a simple process that can be completed in less than a minute
                  if you already have a log-in for ChatGPT, or less than 2 minutes otherwise. Make sure you have funds
                  in your account, or SmartGPT will display an error message.
                </p>
              </div>
              <div className="mb-6">
                <p>
                  If you need a quick 1-minute walkthrough on obtaining an API key, watch this video:{' '}
                  <a
                      href="https://www.youtube.com/watch?v=OB99E7Y1cMA"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:underline"
                  >
                    https://www.youtube.com/watch?v=OB99E7Y1cMA
                  </a>
                </p>
              </div>
              <div className="mb-6">
                <p>Rest assured that none of your API keys are stored on the server; they are only persisted in your
                  local browser storage for your convenience and security.</p>
              </div>
              <div>
                <p>Enjoy using SmartGPT, and let's explore the possibilities of AI reasoning together!</p>
              </div>
            </div>
          </div>


      ) : modelError ? (
          <ErrorMessageDiv error={modelError}/>
      ) : (
          <>
            <div
                className="max-h-[calc(100vh-120px)] overflow-x-hidden"
                ref={chatContainerRef}
                onScroll={handleScroll}
            >
              {selectedConversation?.messages.length === 0 ? (
                  <>
                    <div
                        className="mx-auto flex flex-col space-y-5 max-h-[95vh] md:space-y-10 px-3 mb-200 pt-5 md:pt-12 sm:max-w-[700px]">
                      <div className="text-center text-3xl font-semibold text-gray-800 dark:text-gray-100">
                        {models.length === 0 ? (
                            <div>
                              <Spinner size="16px" className="mx-auto"/>
                            </div>
                        ) : (
                            '🧠 SmartGPT 2.0'
                        )}
                      </div>

                      {models.length > 0 && (
                          <div
                              className="flex h-full flex-col space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">
                            <ModeSelect
                                label={t('Prompt Mode Select')}
                                onChangeMode={(mode) =>
                                    handleUpdateConversation(selectedConversation, {
                                      key: 'promptMode',
                                      value: mode,
                                    })
                                }
                            />

                            <ModelSelect/>

                            <SystemPrompt
                                conversation={selectedConversation}
                                onChangePrompt={(prompt) =>
                                    handleUpdateConversation(selectedConversation, {
                                      key: 'prompt',
                                      value: prompt,
                                    })
                                }
                            />

                            <TemperatureSlider
                                label={t('Temperature')}
                                onChangeTemperature={(temperature) =>
                                    handleUpdateConversation(selectedConversation, {
                                      key: 'temperature',
                                      value: temperature,
                                    })
                                }
                            />

                            {selectedConversation?.promptMode === 'smartgpt' && (
                                <CustomOptions
                          label={t('SmartGPT Options')}
                          promptMode={
                            selectedConversation?.promptMode || 'default'
                          }
                          onChangeOption={(options: PluginOption[]) =>
                            handleUpdateConversation(selectedConversation, {
                              key: 'options',
                              value: options,
                            })
                          }
                        />
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="sticky top-0 z-10 flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
                  {t('Model')}: {selectedConversation?.model.name} | {t('Temp')}
                  : {selectedConversation?.temperature} |
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={handleSettings}
                  >
                    <IconSettings size={18} />
                  </button>
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={onClearAll}
                  >
                    <IconClearAll size={18} />
                  </button>
                </div>
                {showSettings && (
                  <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                    <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                      <ModelSelect />
                    </div>
                  </div>
                )}

                {selectedConversation?.messages.map((message, index) => (
                  <MemoizedChatMessage
                    key={index}
                    message={message}
                    messageIndex={index}
                    onEdit={(editedMessage) => {
                      setCurrentMessage(editedMessage);
                      // discard edited message and the ones that come after then resend
                      handleSend(
                        editedMessage,
                        selectedConversation?.messages.length - index,
                      );
                    }}
                  />
                ))}

                {loading && <ChatLoader />}

                <div
                  className="h-[162px] bg-white dark:bg-[#343541]"
                  ref={messagesEndRef}
                />
              </>
            )}
          </div>

          <ChatInput
            stopConversationRef={stopConversationRef}
            textareaRef={textareaRef}
            onSend={(message, plugin) => {
              setCurrentMessage(message);
              handleSend(message, 0, plugin);
            }}
            onScrollDownClick={handleScrollDown}
            onRegenerate={(plugin) => {
              if (currentMessage) {
                handleSend(currentMessage, 2, plugin);
              }
            }}
            promptMode={selectedConversation?.promptMode || 'default'}
            showScrollDownButton={showScrollDownButton}
          />
        </>
      )}
    </div>
  );
});
Chat.displayName = 'Chat';
