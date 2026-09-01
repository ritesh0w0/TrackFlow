import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAddProjectMember } from '@/hooks/useProjects';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const addMemberSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'MEMBER']),
});

export default function AddMemberDialog({ open, onOpenChange, projectId }) {
  const [apiError, setApiError] = useState(null);
  const addMemberMutation = useAddProjectMember();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  });

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      await addMemberMutation.mutateAsync({
        projectId,
        data,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Add member error:', error);
      setApiError(
        error.response?.data?.message ||
        error.message ||
        'Failed to add member to project'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Add Team Member</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Invite a collaborator to this project by their registered account email.
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <div className="p-3 text-xs bg-red-950/60 border border-red-800 text-red-300 rounded font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300" htmlFor="member-email">
              User Email Address *
            </label>
            <input
              id="member-email"
              type="email"
              placeholder="teammate@company.com"
              {...register('email')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300" htmlFor="member-role">
              Project Role
            </label>
            <select
              id="member-role"
              {...register('role')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="MEMBER">Member (Create & edit assigned tasks)</option>
              <option value="ADMIN">Admin (Manage issues, members & project settings)</option>
            </select>
            {errors.role && (
              <p className="text-xs text-red-400 mt-1">{errors.role.message}</p>
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
              disabled={addMemberMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
            >
              {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
