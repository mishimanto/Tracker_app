import React, { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { notesService } from '../../services/notesService';
import { Note } from '../../types';

interface NotesListProps {
  notes: Note[];
  onSelectNote: (noteId: number) => void;
  onRefresh: () => Promise<void>;
  onDeleteNote: (noteId: number) => void;
}

export const NotesList: React.FC<NotesListProps> = ({ notes, onSelectNote, onRefresh, onDeleteNote }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter((note) =>
      (note.title ?? '').toLowerCase().includes(query) ||
      (note.content ?? '').toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [filteredNotes]);

  const handleDeleteNote = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: 'Delete Note?',
      text: 'This note will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: '!rounded-2xl',
        confirmButton: '!rounded-xl !font-semibold',
        cancelButton: '!rounded-xl !font-semibold',
      },
    });

    if (result.isConfirmed) {
      await notesService.deleteNote(id);
      onDeleteNote(id);
      await onRefresh();
      toast.success('Note deleted!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      {/* Notes Grid */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-slate-100 mb-4">
            <PlusIcon className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No notes yet</p>
          <p className="text-slate-500 text-sm mt-1">Create your first note to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className="group relative p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteNote(note.id, e)}
                className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <TrashIcon className="h-4 w-4" />
              </button>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2 pr-8 line-clamp-2">
                {note.title || 'Untitled'}
              </h3>

              {/* Preview */}
              <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                {note.content || 'No content yet...'}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  {(note.content ?? '').split(/\s+/).filter((w) => w).length} words
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
