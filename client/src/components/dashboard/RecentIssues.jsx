import { Link } from 'react-router-dom';

const statusBadges = {
  TODO: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  IN_PROGRESS: 'bg-amber-950/60 text-amber-300 border-amber-800',
  DONE: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
};

const priorityBadges = {
  CRITICAL: 'text-rose-400 font-bold',
  HIGH: 'text-orange-400 font-medium',
  MEDIUM: 'text-yellow-400',
  LOW: 'text-zinc-400',
};

export default function RecentIssues({ issues, projectId }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Recent Issues</h3>
        <p className="text-xs text-zinc-500">No issues reported yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Recent Issues</h3>
        {projectId && (
          <Link
            to={`/projects/${projectId}/issues`}
            className="text-xs text-zinc-400 hover:text-zinc-100 hover:underline font-medium"
          >
            View all →
          </Link>
        )}
      </div>

      <div className="divide-y divide-zinc-800/80">
        {issues.map((issue) => (
          <div key={issue.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
            <div className="min-w-0 flex-1">
              <Link
                to={`/projects/${issue.projectId || projectId}/issues/${issue.id}`}
                className="font-medium text-zinc-200 hover:text-white hover:underline truncate block"
              >
                {issue.title}
              </Link>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                <span>Assignee: {issue.assignee?.name || 'Unassigned'}</span>
                <span>•</span>
                <span>Reporter: {issue.reporter?.name || 'Unknown'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-2 py-0.5 rounded border text-[10px] font-mono font-medium ${
                  statusBadges[issue.status] || ''
                }`}
              >
                {issue.status}
              </span>
              <span className={`font-mono text-[11px] ${priorityBadges[issue.priority] || ''}`}>
                {issue.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
