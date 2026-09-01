import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema } from '@/validations/comment.schema';
import { useCreateComment } from '@/hooks/useComments';
import { Button } from '@/components/ui/button';

export default function CommentForm({ issueId }) {
  const [apiError, setApiError] = useState(null);
  const createMutation = useCreateComment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      await createMutation.mutateAsync({ issueId, data });
      reset();
    } catch (error) {
      console.error('Comment creation error:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to post comment');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 bg-slate-900 border border-slate-800 rounded-lg p-4">
      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Leave a Comment</h4>

      {apiError && (
        <div className="p-2 text-xs bg-red-950/60 border border-red-800 text-red-300 rounded">
          {apiError}
        </div>
      )}

      <textarea
        rows={3}
        placeholder="Write a comment... (1-1000 characters)"
        {...register('content')}
        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
      />
      {errors.content && (
        <p className="text-xs text-red-400">{errors.content.message}</p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-1.5 h-8"
        >
          {createMutation.isPending ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}
