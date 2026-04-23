import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { adminService } from '../../services/adminService';
import { PageLoaderTransition } from '../../components/UI/PageLoader';

export const AdminNotes: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['admin-all-notes'],
    queryFn: adminService.getAllNotes,
  });

  const deleteNoteMutation = useMutation({
    mutationFn: adminService.deleteNote,
    onSuccess: () => {
      toast.success('Note deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-all-notes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: () => toast.error('Failed to delete note.'),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">All Notes</h1>
          <span className="bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
            {notes.length} notes
          </span>
        </div>

        
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <article key={note.id} className="border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{note.title}</h2>
                    <p className="text-sm text-slate-500">{note.user?.name || 'Unknown user'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                      className="bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="line-clamp-6 text-sm leading-6 text-slate-600">
                  {note.content || 'No content'}
                </p>
              </article>
            ))}
          </div>

      </div>
    </AdminLayout>
  );
};
