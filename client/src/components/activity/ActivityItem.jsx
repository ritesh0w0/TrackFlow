import {
  FolderPlus,
  FileEdit,
  UserPlus,
  Shield,
  UserMinus,
  PlusCircle,
  Trash2,
  RefreshCw,
  Zap,
  UserCheck,
  MessageSquare,
  Edit3,
  Trash,
  Activity,
} from 'lucide-react';

const actionMapping = {
  PROJECT_CREATED: {
    icon: <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />,
    render: (user, meta) => `${user} created project "${meta?.title || 'a project'}"`,
  },
  PROJECT_UPDATED: {
    icon: <FileEdit className="w-3.5 h-3.5 text-zinc-400" />,
    render: (user) => `${user} updated project details`,
  },
  MEMBER_ADDED: {
    icon: <UserPlus className="w-3.5 h-3.5 text-blue-400" />,
    render: (user, meta) => `${user} added member "${meta?.memberName || 'a user'}" as ${meta?.role || 'MEMBER'}`,
  },
  MEMBER_ROLE_UPDATED: {
    icon: <Shield className="w-3.5 h-3.5 text-purple-400" />,
    render: (user, meta) => `${user} updated ${meta?.memberName || 'member'}'s role to ${meta?.to || 'new role'}`,
  },
  MEMBER_REMOVED: {
    icon: <UserMinus className="w-3.5 h-3.5 text-amber-400" />,
    render: (user, meta) => `${user} removed ${meta?.memberName || 'a member'} from the project`,
  },
  ISSUE_CREATED: {
    icon: <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />,
    render: (user, meta) => `${user} created issue "${meta?.title || 'an issue'}"`,
  },
  ISSUE_UPDATED: {
    icon: <FileEdit className="w-3.5 h-3.5 text-zinc-400" />,
    render: (user) => `${user} updated issue details`,
  },
  ISSUE_DELETED: {
    icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
    render: (user, meta) => `${user} deleted issue "${meta?.title || 'an issue'}"`,
  },
  STATUS_CHANGED: {
    icon: <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />,
    render: (user, meta) => `${user} changed status: ${meta?.from || 'old'} → ${meta?.to || 'new'}`,
  },
  PRIORITY_CHANGED: {
    icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
    render: (user, meta) => `${user} changed priority: ${meta?.from || 'old'} → ${meta?.to || 'new'}`,
  },
  ISSUE_ASSIGNED: {
    icon: <UserCheck className="w-3.5 h-3.5 text-indigo-400" />,
    render: (user, meta) => `${user} assigned issue ${meta?.to ? `to team member` : 'unassigned'}`,
  },
  COMMENT_CREATED: {
    icon: <MessageSquare className="w-3.5 h-3.5 text-blue-400" />,
    render: (user, meta) => `${user} commented on "${meta?.issueTitle || 'an issue'}"`,
  },
  COMMENT_UPDATED: {
    icon: <Edit3 className="w-3.5 h-3.5 text-zinc-400" />,
    render: (user) => `${user} edited a comment`,
  },
  COMMENT_DELETED: {
    icon: <Trash className="w-3.5 h-3.5 text-rose-400" />,
    render: (user) => `${user} deleted a comment`,
  },
};

export default function ActivityItem({ activity }) {
  const userName = activity.user?.name || 'User';
  const mapping = actionMapping[activity.action] || {
    icon: <Activity className="w-3.5 h-3.5 text-zinc-400" />,
    render: (user) => `${user} performed ${activity.action.toLowerCase().replace(/_/g, ' ')}`,
  };

  return (
    <div className="relative pl-7 pb-4 border-l border-zinc-800 last:border-l-0 last:pb-0 text-xs">
      <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center">
        {mapping.icon}
      </div>

      <div className="space-y-0.5 pt-0.5">
        <p className="text-zinc-200 font-medium leading-tight">
          {mapping.render(userName, activity.metadata)}
        </p>
        <span className="text-[10px] text-zinc-500 font-mono block">
          {new Date(activity.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
