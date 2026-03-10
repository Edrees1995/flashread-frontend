import axios from 'axios';
import { Document, ContentBlock, Folder, User } from './types';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flashread-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('flashread-token');
      localStorage.removeItem('flashread-user');
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

export async function fetchDocuments(): Promise<Document[]> {
  const res = await api.get('/documents');
  return res.data;
}

export async function fetchDocument(id: number): Promise<Document> {
  const res = await api.get(`/documents/${id}`);
  return res.data;
}

export async function createDocument(folderId?: number | null): Promise<Document> {
  const res = await api.post('/documents', { folder_id: folderId ?? null });
  return res.data;
}

export async function updateDocument(id: number, data: Partial<Document>): Promise<Document> {
  const res = await api.put(`/documents/${id}`, data);
  return res.data;
}

export async function updateBlock(id: number, data: Partial<ContentBlock>): Promise<ContentBlock> {
  const res = await api.put(`/blocks/${id}`, data);
  return res.data;
}

export async function createBlock(data: { document_id: number; type: string; content: string; order_index: number }): Promise<ContentBlock> {
  const res = await api.post('/blocks', data);
  return res.data;
}

export async function deleteBlock(id: number): Promise<void> {
  await api.delete(`/blocks/${id}`);
}

export async function trashDocument(id: number): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export async function fetchTrashedDocuments(): Promise<Document[]> {
  const res = await api.get('/documents/trashed');
  return res.data;
}

export async function restoreDocument(id: number): Promise<Document> {
  const res = await api.put(`/documents/${id}/restore`);
  return res.data;
}

export async function deleteDocumentPermanently(id: number): Promise<void> {
  await api.delete(`/documents/${id}/permanent`);
}

// Folders
export async function fetchFolders(): Promise<Folder[]> {
  const res = await api.get('/folders');
  return res.data;
}

export async function createFolder(data: { name?: string; parent_id?: number | null }): Promise<Folder> {
  const res = await api.post('/folders', data);
  return res.data;
}

export async function updateFolder(id: number, data: { name?: string; parent_id?: number | null }): Promise<Folder> {
  const res = await api.put(`/folders/${id}`, data);
  return res.data;
}

export async function deleteFolder(id: number): Promise<void> {
  await api.delete(`/folders/${id}`);
}

// Profile
export async function updateProfile(data: { name?: string; email?: string; password?: string; currentPassword?: string }): Promise<User> {
  const res = await api.put('/auth/profile', data);
  return res.data;
}

export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function removeAvatar(): Promise<User> {
  const res = await api.delete('/auth/avatar');
  return res.data;
}
