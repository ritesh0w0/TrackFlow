import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { issueSchema } from '@/validations/issue.schema';
import { useCreateIssue, useUpdateIssue } from '@/hooks/useIssues';
import { useProjectMembers } from '@/hooks/useProjects';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function IssueFormDialog({
  open,
  onOpenChange,
  projectId,
  initialValues,
  mode = 'create',
}) {
  const [apiError, setApiError] = useState(null);
  const createMutation = useCreateIssue();
  const updateMutation = useUpdateIssue();
  const { data: members = [] } = useProjectMembers(projectId);

  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      priority: initialValues?.priority || 'MEDIUM',
      dueDate: initialValues?.dueDate
        ? new Date(initialValues.dueDate).toISOString().split('T')[0]
        : '',
      tags: initialValues?.tags ? initialValues.tags.join(', ') : '',
    },
  });

  useEffect(() => {
    if (open) {
      setApiError(null);
      reset({
        title: initialValues?.title || '',
        description: initialValues?.description || '',
        priority: initialValues?.priority || 'MEDIUM',
        dueDate: initialValues?.dueDate
          ? new Date(initialValues.dueDate).toISOString().split('T')[0]
          : '',
        tags: initialValues?.tags ? initialValues.tags.join(', ') : '',
      });
    }
  }, [open, initialValues, reset]);

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const parsedTags = data.tags
        ? (typeof data.tags === 'string' ? data.tags.split(',') : data.tags)
            .map((t) => t.trim().replace(/^#/, ''))
            .filter((t) => t.length > 0)
        : [];

      const payload = {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        tags: parsedTags,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ issueId: initialValues.id, data: payload });
      } else {
        await createMutation.mutateAsync({ projectId, data: payload });
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Issue submit error:', error);
      setApiError(error.response?.data?.message || error.message || 'Operation failed');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">
            {isEdit ? 'Edit Issue' : 'Create New Issue'}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            {isEdit ? 'Update issue attributes and details below.' : 'Add a new issue to track bug, task, or feature.'}
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <div className="p-3 text-xs bg-red-950/60 border border-red-800 text-red-300 rounded font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300" htmlFor="issue-title">
              Issue Title *
            </label>
            <input
              id="issue-title"
              type="text"
              placeholder="e.g. Fix navigation drawer crash on mobile"
              {...register('title')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.title && (
              <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300" htmlFor="issue-description">
              Description
            </label>
            <textarea
              id="issue-description"
              rows={4}
              placeholder="Describe steps to reproduce, acceptance criteria, or context..."
              {...register('description')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none text-xs"
            />
            {errors.description && (
              <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300" htmlFor="issue-priority">
                Priority
              </label>
              <select
                id="issue-priority"
                {...register('priority')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              {errors.priority && (
                <p className="text-xs text-red-400 mt-1">{errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300" htmlFor="issue-duedate">
                Due Date
              </label>
              <input
                id="issue-duedate"
                type="date"
                {...register('dueDate')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.dueDate && (
                <p className="text-xs text-red-400 mt-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300" htmlFor="issue-tags">
              Labels / Tags <span className="text-[10px] text-slate-500">(comma-separated)</span>
            </label>
            <input
              id="issue-tags"
              type="text"
              placeholder="frontend, bug, auth, p1"
              {...register('tags')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.tags && (
              <p className="text-xs text-red-400 mt-1">{errors.tags.message}</p>
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
              {isLoading
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                ? 'Save Changes'
                : 'Create Issue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
