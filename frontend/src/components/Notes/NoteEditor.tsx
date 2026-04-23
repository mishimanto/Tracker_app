import React, { useEffect, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { notesService } from '../../services/notesService';
import { Note } from '../../types';

interface NoteEditorProps {
  noteId?: number;
  isNew?: boolean;
  onBack: () => void;
  onDelete?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  noteId,
  isNew,
  onBack,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    if (!noteId || isNew) {
      return;
    }

    notesService.getNote(noteId).then((foundNote) => {
      if (!foundNote) {
        return;
      }

      setNote(foundNote);
      setTitle(foundNote.title ?? '');
      setContent(foundNote.content ?? '');
      setSaveStatus('saved');
    });
  }, [noteId, isNew]);

  const safeTitle = title ?? '';
  const safeContent = content ?? '';
  const wordCount = safeContent.split(/\s+/).filter((word) => word).length;

  const handleSave = async () => {
    if (!safeTitle.trim()) {
      toast.error('Please enter a title before saving.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 300));

      if (noteId && !isNew) {
        const updatedNote = await notesService.updateNote(noteId, safeTitle, safeContent);
        setNote(updatedNote);
      } else {
        const newNote = await notesService.createNote(safeTitle, safeContent);
        setNote(newNote);
      }

      setSaveStatus('saved');
      toast.success('Note saved!');
    } catch (error) {
      console.error('Failed to save note:', error);
      setSaveStatus('unsaved');
      toast.error('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteId) return;

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
      await notesService.deleteNote(noteId);
      toast.success('Note deleted!');
      onDelete?.();
      onBack();
    }
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([safeContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${safeTitle || 'note'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (saveStatus === 'saved') setSaveStatus('unsaved');
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (saveStatus === 'saved') setSaveStatus('unsaved');
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <input
              type="text"
              value={safeTitle}
              onChange={handleTitleChange}
              placeholder="Note title..."
              className="border-none bg-transparent text-2xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                saveStatus === 'saved'
                  ? 'bg-emerald-50 text-emerald-700'
                  : saveStatus === 'saving'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-700'
              }`}
            >
              {saveStatus === 'saved'
                ? 'Saved'
                : saveStatus === 'saving'
                  ? 'Saving...'
                  : 'Unsaved'}
            </div>

            <button
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100"
              title="Download as TXT"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>

            {noteId && !isNew && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-red-600 transition-colors hover:bg-red-50"
                title="Delete note"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving || !safeTitle.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <textarea
          value={safeContent}
          onChange={handleContentChange}
          placeholder="Start typing your note here..."
          className="flex-1 resize-none border-none bg-white px-4 py-4 font-sans text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:px-6 sm:py-5"
        />
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 sm:px-6">
        <div className="flex items-center justify-between">
          <span>
            {safeContent.length} characters · {wordCount} words
          </span>
          {note && <span>Last updated {new Date(note.updated_at).toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
};
