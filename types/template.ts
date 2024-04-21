import {BaseModel} from "@/types/BaseModel";

export interface Template {
  id: string;
  name: string;
  description: string;
  promptMode: string;
  num_asks: number;
  content: string;
  model: BaseModel;
  folderId: string | null;
}
