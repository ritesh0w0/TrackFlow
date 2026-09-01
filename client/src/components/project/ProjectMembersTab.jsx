import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  useProjectMembers,
  useUpdateProjectMemberRole,
  useRemoveProjectMember,
} from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import AddMemberDialog from './AddMemberDialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

const ROLE_BADGES = {
  OWNER: 'bg-zinc-800 text-zinc-200 border-zinc-700',
  ADMIN: 'bg-purple-950/60 text-purple-300 border-purple-800',
  MEMBER: 'bg-zinc-950 text-zinc-400 border-zinc-800',
};

export default function ProjectMembersTab() {
  const { project, isOwner } = useOutletContext();
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const { data: members = [], isLoading, isError, error, refetch } = useProjectMembers(project?.id);
  const updateRoleMutation = useUpdateProjectMemberRole();
  const removeMemberMutation = useRemoveProjectMember();

  const currentUserMembership = members.find((m) => m.userId === user?.id);
  const canManageMembers = isOwner || currentUserMembership?.role === 'ADMIN';

  const handleRoleChange = (memberId, newRole) => {
    updateRoleMutation.mutate({
      projectId: project.id,
      memberId,
      data: { role: newRole },
    });
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    try {
      await removeMemberMutation.mutateAsync({
        projectId: project.id,
        memberId: memberToRemove.id,
      });
      setMemberToRemove(null);
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3 animate-pulse">
        <div className="h-6 bg-zinc-800 rounded w-1/4" />
        <div className="h-12 bg-zinc-800 rounded" />
        <div className="h-12 bg-zinc-800 rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-950/50 border border-red-800 p-6 rounded-lg text-center space-y-3">
        <p className="text-sm font-medium text-red-300">
          Failed to load project members: {error?.response?.data?.message || error?.message || 'Server error'}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-700 text-red-300 hover:bg-red-900 text-xs">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Project Members</h2>
          <p className="text-xs text-zinc-400">
            {members.length} team collaborator{members.length === 1 ? '' : 's'} in this project
          </p>
        </div>

        {canManageMembers && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold"
          >
            + Add Member
          </Button>
        )}
      </div>

      {/* Members List Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                {canManageMembers && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {members.map((member) => {
                const isSelf = member.userId === user?.id;
                const isMemberOwner = member.role === 'OWNER';

                return (
                  <tr key={member.id} className="hover:bg-zinc-900/60 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-zinc-700">
                        <AvatarFallback className="bg-zinc-800 text-zinc-100 text-xs font-semibold">
                          {(member.user?.name || 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                          <span>{member.user?.name}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-mono">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500">{member.user?.email}</div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      {canManageMembers && !isMemberOwner && !isSelf ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          disabled={updateRoleMutation.isPending}
                          className="bg-zinc-950 border border-zinc-700/80 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
                            ROLE_BADGES[member.role] || ROLE_BADGES.MEMBER
                          }`}
                        >
                          {member.role}
                        </span>
                      )}
                    </td>

                    {/* Joined date */}
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    {canManageMembers && (
                      <td className="py-3.5 px-4 text-right">
                        {!isMemberOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMemberToRemove(member)}
                            disabled={removeMemberMutation.isPending}
                            className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2"
                          >
                            Remove
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddMemberDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        projectId={project?.id}
      />

      {/* Remove Confirmation Alert */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100 text-base">
              Remove {memberToRemove?.user?.name || 'Member'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs">
              This user will lose access to this project, its issues, and activity feed. Any issues currently assigned to them will become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
