import { useComments } from '@/hooks/useComments';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { Button } from '@/components/ui/button';

export default function CommentList({ issueId }) {
  const { data: comments = [], isLoading, isError, error, refetch } = useComments(issueId);

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">
          Comments ({comments.length})
        </h3>
      </div>

      <CommentForm issueId={issueId} />

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-slate-900 border border-slate-800 rounded-lg" />
          <div className="h-20 bg-slate-900 border border-slate-800 rounded-lg" />
        </div>
      ) : isError ? (
        <div className="bg-red-950/50 border border-red-800 p-4 rounded-lg text-center space-y-2">
          <p className="text-xs font-medium text-red-300">
            Failed to load comments: {error?.response?.data?.message || error?.message || 'Server error'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-700 text-red-300 text-xs h-7">
            Try Again
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-6 text-center text-xs text-slate-500">
          No comments yet — start the discussion.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
