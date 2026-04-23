import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { UserLayout } from '../../components/Layout/UserLayout';
import { NotesList } from '../../components/Notes/NotesList';
import { NoteEditor } from '../../components/Notes/NoteEditor';
import { notesService } from '../../services/notesService';
import { PageLoaderTransition } from '../../components/UI/PageLoader';
import { Note } from '../../types';

export const Notepad: React.FC = () => {
  const navigate = useNavigate();
  const { noteId } = useParams<{ noteId?: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadNotes();
  }, []);

  useEffect(() => {
    if (noteId) {
      setIsEditing(true);
    }
  }, [noteId]);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const loadedNotes = await notesService.getNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
      toast.error('Failed to load notes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await notesService.createNote('Untitled Note');
      setNotes((current) => [newNote, ...current]);
      navigate(`/notepad/${newNote.id}`);
      setIsEditing(true);
    } catch (error) {
      toast.error('Failed to create note.');
    }
  };

  const handleSelectNote = (id: number) => {
    navigate(`/notepad/${id}`);
    setIsEditing(true);
  };

  const handleBack = () => {
    navigate('/notepad');
    setIsEditing(false);
    void loadNotes();
  };

  const handleDeleteNote = (id: number) => {
    setNotes((current) => current.filter((note) => note.id !== id));
  };

  const handleRefresh = async () => {
    await loadNotes();
  };

  if (isEditing && noteId) {
    return (
      <div className="h-screen bg-slate-50">
        <NoteEditor
          noteId={Number(noteId)}
          onBack={handleBack}
          onDelete={() => {
            handleDeleteNote(Number(noteId));
            handleBack();
          }}
        />
      </div>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          
            <NotesList
              notes={notes}
              onSelectNote={handleSelectNote}
              onRefresh={handleRefresh}
              onDeleteNote={handleDeleteNote}
            />
          
        </section>

        {notes.length > 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-6 py-4">
            <p className="text-sm font-medium text-blue-900">
              Tip: You have <strong>{notes.length}</strong> note{notes.length !== 1 ? 's' : ''} saved.
              Click on any note to edit it, or create a new one using the button below.
            </p>
          </div>
        )}

        <button
          onClick={handleCreateNote}
          className="group fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl active:scale-95 md:bottom-10 md:right-10 lg:bottom-12 lg:right-12"
          title="Create new note"
        >
          <PlusIcon className="h-7 w-7 transition-transform group-hover:scale-125" />
        </button>
      </div>
    </UserLayout>
  );
};
