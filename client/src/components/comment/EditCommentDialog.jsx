import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema } from '@/validations/comment.schema';
import { useUpdateComment } from '@/hooks/useComments';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function EditCommentDialog({ open, onOpenChange, comment }) {
  const [apiError, setApiError] = useState(null);
  const updateMutation = useUpdateComment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: comment?.content || '' },
  });

  useEffect(() => {
    if (open && comment) {
      setApiError(null);
      reset({ content: comment.content || '' });
    }
  }, [open, comment, reset]);

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      await updateMutation.mutateAsync({ commentId: comment.id, data });
      onOpenChange(false);
    } catch (error) {
      console.error('Update comment error:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to update comment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-base">Edit Comment</DialogTitle>
        </DialogHeader>

        {apiError && (
          <div className="p-2 text-xs bg-red-950/60 border border-red-800 text-red-300 rounded">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <textarea
            rows={4}
            {...register('content')}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
          {errors.content && (
            <p className="text-xs text-red-400">{errors.content.message}</p>
          )}

          <DialogFooter className="gap-2">
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
              disabled={updateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Comment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
