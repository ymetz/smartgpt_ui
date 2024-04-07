import { FC } from 'react';
import { PromptComponent } from './Prompt';
import { Conversation } from '@/types/chat';

interface Props {
  templates: Conversation[];
}

export const Prompts: FC<Props> = ({ templates }) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {templates
        .slice()
        .reverse()
        .map((template, index) => (
          <PromptComponent key={index} template={template} />
        ))}
    </div>
  );
};
