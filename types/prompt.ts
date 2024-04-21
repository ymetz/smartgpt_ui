import {BaseModel} from "@/types/BaseModel";

export interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  model: BaseModel;
  folderId: string | null;
}
