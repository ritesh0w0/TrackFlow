import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDeleteComment } from '@/hooks/useComments';
import EditCommentDialog from './EditCommentDialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function CommentItem({ comment }) {
  const { user: currentUser } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteMutation = useDeleteComment();

  const isAuthor = currentUser?.id === (comment.user?.id || comment.userId);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(comment.id);
    }
  };

  const authorName = comment.user?.name || 'User';
  const initials = authorName.slice(0, 2).toUpperCase();

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-slate-800 text-slate-300 text-[10px]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold text-slate-200">{authorName}</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="h-6 text-[11px] text-slate-400 hover:text-white px-1.5"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="h-6 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-950/40 px-1.5"
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed pl-8 whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      {isAuthor && (
        <EditCommentDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          comment={comment}
        />
      )}
    </>
  );
}
