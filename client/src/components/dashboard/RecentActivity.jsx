export default function RecentActivity({ activity }) {
  if (!activity || activity.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-3">Recent Activity</h3>
        <p className="text-xs text-slate-500">No activity recorded yet.</p>
      </div>
    );
  }

  const formatActivityText = (item) => {
    const userName = item.user?.name || 'A user';
    const action = item.action;
    const meta = item.metadata || {};

    switch (action) {
      case 'PROJECT_CREATED':
        return `${userName} created the project`;
      case 'PROJECT_UPDATED':
        return `${userName} updated project settings`;
      case 'MEMBER_ADDED':
        return `${userName} added member ${meta.memberName || 'a user'} (${meta.role || 'MEMBER'})`;
      case 'MEMBER_ROLE_UPDATED':
        return `${userName} updated ${meta.memberName || 'member'}'s role to ${meta.to || 'new role'}`;
      case 'MEMBER_REMOVED':
        return `${userName} removed ${meta.memberName || 'a member'}`;
      case 'ISSUE_CREATED':
        return `${userName} created issue "${meta.title || item.entityId}"`;
      case 'ISSUE_UPDATED':
        return `${userName} updated issue details`;
      case 'ISSUE_DELETED':
        return `${userName} deleted issue "${meta.title || ''}"`;
      case 'STATUS_CHANGED':
        return `${userName} changed status: ${meta.from || ''} → ${meta.to || ''}`;
      case 'PRIORITY_CHANGED':
        return `${userName} changed priority: ${meta.from || ''} → ${meta.to || ''}`;
      case 'ISSUE_ASSIGNED':
        return `${userName} updated issue assignment`;
      case 'COMMENT_CREATED':
        return `${userName} added a comment${meta.issueTitle ? ` on "${meta.issueTitle}"` : ''}`;
      case 'COMMENT_UPDATED':
        return `${userName} edited a comment`;
      case 'COMMENT_DELETED':
        return `${userName} deleted a comment`;
      default:
        return `${userName} performed ${action.toLowerCase().replace(/_/g, ' ')}`;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-200">Recent Activity</h3>
      <div className="space-y-3 divide-y divide-slate-800/60">
        {activity.map((item) => (
          <div key={item.id} className="pt-2.5 first:pt-0 flex items-start gap-3 text-xs">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 truncate font-medium">{formatActivityText(item)}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
