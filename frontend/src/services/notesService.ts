import { apiService } from './api';
import { Note } from '../types';

interface LaravelApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const normalizeNote = (note: Partial<Note> | null | undefined): Note | null => {
  if (!note || typeof note.id !== 'number') {
    return null;
  }

  return {
    ...note,
    id: note.id,
    title: typeof note.title === 'string' ? note.title : '',
    content: typeof note.content === 'string' ? note.content : '',
    created_at: typeof note.created_at === 'string' ? note.created_at : '',
    updated_at: typeof note.updated_at === 'string' ? note.updated_at : '',
  } as Note;
};

class NotesService {
  async getNotes(search = ''): Promise<Note[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await apiService.get<LaravelApiResponse<Note[]>>(`/notes${query}`);
    return Array.isArray(response?.data)
      ? response.data
          .map((note) => normalizeNote(note))
          .filter((note): note is Note => note !== null)
      : [];
  }

  async getNote(id: number): Promise<Note | null> {
    const response = await apiService.get<LaravelApiResponse<Note>>(`/notes/${id}`);
    return normalizeNote(response?.data);
  }

  async createNote(title: string, content = ''): Promise<Note> {
    const response = await apiService.post<LaravelApiResponse<Note>>('/notes', {
      title,
      content,
    });

    if (!response?.data) {
      throw new Error('Failed to create note');
    }

    return normalizeNote(response.data) as Note;
  }

  async updateNote(id: number, title: string, content: string): Promise<Note> {
    const response = await apiService.put<LaravelApiResponse<Note>>(`/notes/${id}`, {
      title,
      content,
    });

    if (!response?.data) {
      throw new Error('Failed to update note');
    }

    return normalizeNote(response.data) as Note;
  }

  async deleteNote(id: number): Promise<boolean> {
    const response = await apiService.delete<LaravelApiResponse<null>>(`/notes/${id}`);
    return response?.success === true;
  }
}

export const notesService = new NotesService();
