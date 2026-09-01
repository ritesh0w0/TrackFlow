import { useState } from 'react';
import { useDeleteIssue } from '@/hooks/useIssues';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DeleteIssueDialog({ open, onOpenChange, issue, redirectOnDelete = false }) {
  const [apiError, setApiError] = useState(null);
  const deleteMutation = useDeleteIssue();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setApiError(null);
    try {
      await deleteMutation.mutateAsync(issue.id);
      onOpenChange(false);
      if (redirectOnDelete && issue?.projectId) {
        navigate(`/projects/${issue.projectId}/issues`);
      }
    } catch (error) {
      console.error('Delete issue error:', error);
      setApiError(error.response?.data?.message || error.message || 'Failed to delete issue');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete Issue?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400 text-xs">
            Are you sure you want to delete <span className="font-semibold text-slate-200">{issue?.title}</span>? This action cannot be undone and will permanently remove all associated comments.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {apiError && (
          <div className="p-3 text-xs bg-red-950/60 border border-red-800 text-red-300 rounded font-medium">
            {apiError}
          </div>
        )}

        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-slate-800 text-slate-300 hover:bg-slate-800 text-xs"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-500 text-white text-xs"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Issue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
