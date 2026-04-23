import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { adminService } from '../../services/adminService';
import { PageLoaderTransition } from '../../components/UI/PageLoader';
import { ExpenseCategory } from '../../types';
import { resolveBrandingAssetUrl } from '../../utils/branding';

export const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminService.getSettings,
  });
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-expense-categories'],
    queryFn: adminService.getExpenseCategories,
  });
  const { data: feedbackMessages = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['admin-feedback-messages'],
    queryFn: adminService.getFeedbackMessages,
  });

  const [form, setForm] = useState({
    site_name: '',
    support_email: '',
    currency_code: 'BDT',
    allow_registration: true,
    maintenance_mode: false,
    report_footer: '',
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '',
    color: '#0f172a',
  });
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => {
    if (!settings) {
      return;
    }

    setForm({
      site_name: settings.site_name || '',
      support_email: settings.support_email || '',
      currency_code: settings.currency_code || 'BDT',
      allow_registration: Boolean(settings.allow_registration),
      maintenance_mode: Boolean(settings.maintenance_mode),
      report_footer: settings.report_footer || '',
    });
  }, [settings]);

  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [faviconPreviewUrl, setFaviconPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  useEffect(() => {
    if (!faviconFile) {
      setFaviconPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(faviconFile);
    setFaviconPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [faviconFile]);

  const updateMutation = useMutation({
    mutationFn: adminService.updateSettings,
    onSuccess: () => {
      toast.success('Settings updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      setLogoFile(null);
      setFaviconFile(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update settings.';
      toast.error(message);
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: adminService.createExpenseCategory,
    onSuccess: () => {
      toast.success('Expense category added.');
      setCategoryForm({
        name: '',
        icon: '',
        color: '#0f172a',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-expense-categories'] });
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    },
    onError: () => {
      toast.error('Failed to add expense category.');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Pick<ExpenseCategory, 'name' | 'icon' | 'color'>> }) =>
      adminService.updateExpenseCategory(id, data),
    onSuccess: () => {
      toast.success('Expense category updated.');
      resetCategoryForm();
      queryClient.invalidateQueries({ queryKey: ['admin-expense-categories'] });
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    },
    onError: () => {
      toast.error('Failed to update expense category.');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: adminService.deleteExpenseCategory,
    onSuccess: () => {
      toast.success('Expense category deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-expense-categories'] });
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete expense category.';
      toast.error(message);
    },
  });

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      name: '',
      icon: '',
      color: '#0f172a',
    });
  };

  const submitCategory = () => {
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      icon: categoryForm.icon.trim() || null,
      color: categoryForm.color || '#0f172a',
    };

    if (editingCategoryId) {
      updateCategoryMutation.mutate({ id: editingCategoryId, data: payload });
      return;
    }

    createCategoryMutation.mutate(payload);
  };

  const startEditingCategory = (category: ExpenseCategory) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      icon: category.icon || '',
      color: category.color || '#0f172a',
    });
  };

  const categoryMutationPending = createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const currentLogoUrl = logoPreviewUrl || resolveBrandingAssetUrl(settings?.logo_url || settings?.logo_path);
  const currentFaviconUrl = faviconPreviewUrl || resolveBrandingAssetUrl(settings?.favicon_url || settings?.favicon_path);

  const submitSettings = () => {
    const payload = new FormData();
    payload.append('_method', 'PUT');
    payload.append('site_name', form.site_name);
    payload.append('currency_code', form.currency_code);
    payload.append('allow_registration', String(form.allow_registration ? 1 : 0));
    payload.append('maintenance_mode', String(form.maintenance_mode ? 1 : 0));

    if (form.support_email.trim()) {
      payload.append('support_email', form.support_email.trim());
    }

    if (form.report_footer.trim()) {
      payload.append('report_footer', form.report_footer.trim());
    }

    if (logoFile) {
      payload.append('logo', logoFile);
    }

    if (faviconFile) {
      payload.append('favicon', faviconFile);
    }

    updateMutation.mutate(payload);
  };

  return (
   
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Site Name</span>
                  <input
                    value={form.site_name}
                    onChange={(event) => setForm((current) => ({ ...current, site_name: event.target.value }))}
                    className="w-full border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Support Email</span>
                  <input
                    value={form.support_email}
                    onChange={(event) => setForm((current) => ({ ...current, support_email: event.target.value }))}
                    className="w-full border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Currency Code</span>
                  <input
                    value={form.currency_code}
                    onChange={(event) => setForm((current) => ({ ...current, currency_code: event.target.value.toUpperCase() }))}
                    className="w-full border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </label>

                <div className="grid gap-4 border border-slate-200 bg-slate-50 p-4">
                  <label className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-700">Allow Registration</span>
                    <input
                      type="checkbox"
                      checked={form.allow_registration}
                      onChange={(event) => setForm((current) => ({ ...current, allow_registration: event.target.checked }))}
                      className="h-4 w-4"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-700">Maintenance Mode</span>
                    <input
                      type="checkbox"
                      checked={form.maintenance_mode}
                      onChange={(event) => setForm((current) => ({ ...current, maintenance_mode: event.target.checked }))}
                      className="h-4 w-4"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                  <label className="space-y-3">
                    <span className="text-sm font-medium text-slate-700">App Logo</span>
                    <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
                      {currentLogoUrl ? (
                        <img
                          src={currentLogoUrl}
                          alt="App logo preview"
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-600">
                          {form.site_name.trim().charAt(0).toUpperCase() || 'A'}
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg,.webp"
                        onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                      />
                    </div>
                    <p className="text-xs text-slate-500">Raster images are automatically optimized and stored as WebP.</p>
                  </label>

                  <label className="space-y-3">
                    <span className="text-sm font-medium text-slate-700">Favicon</span>
                    <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
                      {currentFaviconUrl ? (
                        <img
                          src={currentFaviconUrl}
                          alt="Favicon preview"
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                          {form.site_name.trim().charAt(0).toUpperCase() || 'A'}
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".ico,.png,.svg,.webp"
                        onChange={(event) => setFaviconFile(event.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                      />
                    </div>
                    <p className="text-xs text-slate-500">PNG/WebP uploads are optimized automatically. SVG/ICO stay in original format.</p>
                  </label>
                </div>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Report Footer</span>
                  <textarea
                    value={form.report_footer}
                    onChange={(event) => setForm((current) => ({ ...current, report_footer: event.target.value }))}
                    rows={5}
                    className="w-full border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    placeholder="This text will appear at the bottom of generated reports."
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={submitSettings}
                  disabled={updateMutation.isPending}
                  className="bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Expense Categories ({categories.length})</h2>
                  </div>
                </div>

                <div className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Category Name</span>
                    <input
                      value={categoryForm.name}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                      placeholder="e.g. Office Supplies"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px]">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Icon or Label</span>
                      <input
                        value={categoryForm.icon}
                        onChange={(event) => setCategoryForm((current) => ({ ...current, icon: event.target.value }))}
                        className="w-full border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                        placeholder="Optional"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Color</span>
                      <input
                        type="color"
                        value={categoryForm.color}
                        onChange={(event) => setCategoryForm((current) => ({ ...current, color: event.target.value }))}
                        className="h-12.5 w-full border border-slate-200 bg-white px-2 py-2"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    {editingCategoryId && (
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={submitCategory}
                      disabled={categoryMutationPending}
                      className="bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      {categoryMutationPending ? 'Saving...' : editingCategoryId ? 'Update Category' : 'Add Category'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Existing Categories</h3>
                </div>

                <div className="divide-y divide-slate-200">
                  {categoriesLoading ? (
                    <div className="px-6 py-8 text-sm text-slate-500">Loading expense categories...</div>
                  ) : categories.length === 0 ? (
                    <div className="px-6 py-8 text-sm text-slate-500">No expense categories found yet.</div>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <span
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-700"
                            style={{ backgroundColor: category.color || '#e2e8f0' }}
                          >
                            {category.icon || category.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">{category.name}</div>
                            <div className="text-sm text-slate-500">
                              {category.expenses_count || 0} linked expenses
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 md:justify-end">
                          <button
                            type="button"
                            onClick={() => startEditingCategory(category)}
                            className="border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
                            disabled={deleteCategoryMutation.isPending}
                            className="border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    
  );
};
