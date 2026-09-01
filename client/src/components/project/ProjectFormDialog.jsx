import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '@/validations/project.schema';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ProjectFormDialog({ open, onOpenChange, initialValues, mode = 'create' }) {
  const [apiError, setApiError] = useState(null);
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialValues?.title || initialValues?.name || '',
      description: initialValues?.description || '',
    },
  });

  useEffect(() => {
    if (open) {
      setApiError(null);
      reset({
        title: initialValues?.title || initialValues?.name || '',
        description: initialValues?.description || '',
      });
    }
  }, [open, initialValues, reset]);

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: initialValues.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Project submit error:', error);
      setApiError(error.response?.data?.message || error.message || 'Operation failed');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">
            {isEdit ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            {isEdit
              ? 'Update your project details below.'
              : 'Add a new project to organize issues and track progress.'}
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <div className="p-3 text-xs bg-red-950/60 border border-red-800 text-red-300 rounded font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300" htmlFor="project-title">
              Project Title *
            </label>
            <input
              id="project-title"
              type="text"
              placeholder="e.g. Frontend Redesign"
              {...register('title')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.title && (
              <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300" htmlFor="project-description">
              Description
            </label>
            <textarea
              id="project-description"
              rows={3}
              placeholder="Brief description of project scope..."
              {...register('description')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-slate-800 text-slate-300 hover:bg-slate-800 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
            >
              {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
