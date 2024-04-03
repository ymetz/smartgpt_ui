import { Conversation } from "@/types/chat";

export const updateTemplate = (updatedTemplate: Conversation, allTemplates: Conversation[]) => {
  const updatedTemplates = allTemplates.map((c) => {
    if (c.id === updatedTemplate.id) {
      return updatedTemplate;
    }

    return c;
  });

  saveTemplates(updatedTemplates);

  return {
    single: updatedTemplate,
    all: updatedTemplates,
  };
};

export const saveTemplates = (templates: Conversation[]) => {
  localStorage.setItem('savedTemplates', JSON.stringify(templates));
};
