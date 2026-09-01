const actionMapping = {
  PROJECT_CREATED: {
    icon: '🚀',
    render: (user, meta) => `${user} created project "${meta?.title || 'a project'}"`,
  },
  PROJECT_UPDATED: {
    icon: '⚙️',
    render: (user, meta) => `${user} updated project details`,
  },
  MEMBER_ADDED: {
    icon: '👥',
    render: (user, meta) => `${user} added member "${meta?.memberName || 'a user'}" as ${meta?.role || 'MEMBER'}`,
  },
  MEMBER_ROLE_UPDATED: {
    icon: '🛡️',
    render: (user, meta) => `${user} updated ${meta?.memberName || 'member'}'s role to ${meta?.to || 'new role'}`,
  },
  MEMBER_REMOVED: {
    icon: '👋',
    render: (user, meta) => `${user} removed ${meta?.memberName || 'a member'} from the project`,
  },
  ISSUE_CREATED: {
    icon: '✨',
    render: (user, meta) => `${user} created issue "${meta?.title || 'an issue'}"`,
  },
  ISSUE_UPDATED: {
    icon: '📝',
    render: (user, meta) => `${user} updated issue details`,
  },
  ISSUE_DELETED: {
    icon: '🗑️',
    render: (user, meta) => `${user} deleted issue "${meta?.title || 'an issue'}"`,
  },
  STATUS_CHANGED: {
    icon: '🔄',
    render: (user, meta) => `${user} changed status: ${meta?.from || 'old'} → ${meta?.to || 'new'}`,
  },
  PRIORITY_CHANGED: {
    icon: '⚡',
    render: (user, meta) => `${user} changed priority: ${meta?.from || 'old'} → ${meta?.to || 'new'}`,
  },
  ISSUE_ASSIGNED: {
    icon: '👤',
    render: (user, meta) => `${user} assigned issue ${meta?.to ? `to team member` : 'unassigned'}`,
  },
  COMMENT_CREATED: {
    icon: '💬',
    render: (user, meta) => `${user} commented on "${meta?.issueTitle || 'an issue'}"`,
  },
  COMMENT_UPDATED: {
    icon: '✏️',
    render: (user, meta) => `${user} edited a comment`,
  },
  COMMENT_DELETED: {
    icon: '❌',
    render: (user, meta) => `${user} deleted a comment`,
  },
};

export default function ActivityItem({ activity }) {
  const userName = activity.user?.name || 'User';
  const mapping = actionMapping[activity.action] || {
    icon: '📌',
    render: (user) => `${user} performed ${activity.action.toLowerCase().replace(/_/g, ' ')}`,
  };

  return (
    <div className="relative pl-6 pb-4 border-l border-slate-800 last:border-l-0 last:pb-0 text-xs">
      <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px]">
        {mapping.icon}
      </div>

      <div className="space-y-0.5">
        <p className="text-slate-200 font-medium leading-tight">
          {mapping.render(userName, activity.metadata)}
        </p>
        <span className="text-[10px] text-slate-500 font-mono block">
          {new Date(activity.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
