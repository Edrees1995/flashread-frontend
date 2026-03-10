export interface ContentBlock {
  id: number;
  document_id: number;
  type: 'heading' | 'paragraph' | 'sentence';
  content: string;
  order_index: number;
  created_at: string;
}

export interface Document {
  id: number;
  title: string;
  trashed: boolean;
  folder_id: number | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  blocks?: ContentBlock[];
}

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  user_id: number;
  created_at: string;
  children?: Folder[];
  documents?: Document[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}
