import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUpdateIssueStatus, useUpdateIssuePriority } from '@/hooks/useIssues';
import { Calendar, AlertCircle } from 'lucide-react';

const PRIORITY_COLORS = {
  CRITICAL: 'text-red-400 font-bold',
  HIGH: 'text-orange-400 font-medium',
  MEDIUM: 'text-amber-400',
  LOW: 'text-zinc-400',
};

export default function IssueRow({ issue, projectId, showProject = false, onEdit, onDelete }) {
  const statusMutation = useUpdateIssueStatus();
  const priorityMutation = useUpdateIssuePriority();

  const handleStatusChange = (e) => {
    statusMutation.mutate({ issueId: issue.id, status: e.target.value });
  };

  const handlePriorityChange = (e) => {
    priorityMutation.mutate({ issueId: issue.id, priority: e.target.value });
  };

  const targetProjectId = projectId || issue.projectId;
  const isOverdue =
    issue.dueDate &&
    new Date(issue.dueDate) < new Date() &&
    issue.status !== 'DONE';

  return (
    <tr className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors text-xs">
      {/* Title, tags, due date */}
      <td className="py-3.5 px-4 min-w-[240px]">
        <div className="space-y-1">
          <Link
            to={`/projects/${targetProjectId}/issues/${issue.id}`}
            className="font-semibold text-zinc-100 hover:text-zinc-300 transition-colors line-clamp-1"
          >
            {issue.title}
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            {issue.dueDate && (
              <span
                className={`font-mono flex items-center gap-1 ${
                  isOverdue ? 'text-red-400 font-bold' : 'text-zinc-500'
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="w-3 h-3 text-red-400" />
                ) : (
                  <Calendar className="w-3 h-3 text-zinc-500" />
                )}
                {isOverdue ? 'Overdue: ' : ''}
                {new Date(issue.dueDate).toLocaleDateString()}
              </span>
            )}

            {issue.tags && issue.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {issue.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-zinc-800 text-zinc-400 border border-zinc-700/60 px-1.5 py-0.2 rounded font-mono text-[9px]"
                  >
                    #{tag}
                  </span>
                ))}
                {issue.tags.length > 3 && (
                  <span className="text-zinc-500 text-[9px]">
                    +{issue.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Project column if in global view */}
      {showProject && (
        <td className="py-3.5 px-4">
          <Link
            to={`/projects/${targetProjectId}`}
            className="text-[11px] text-zinc-300 hover:text-white hover:underline font-medium truncate max-w-[120px] block"
          >
            {issue.project?.title || 'Project'}
          </Link>
        </td>
      )}

      {/* Status Dropdown */}
      <td className="py-3.5 px-4">
        <select
          value={issue.status}
          onChange={handleStatusChange}
          disabled={statusMutation.isPending}
          className="bg-zinc-950 border border-zinc-800 text-xs rounded px-2.5 py-1 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer font-medium"
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </td>

      {/* Priority Dropdown */}
      <td className="py-3.5 px-4">
        <select
          value={issue.priority}
          onChange={handlePriorityChange}
          disabled={priorityMutation.isPending}
          className={`bg-zinc-950 border border-zinc-800 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer ${
            PRIORITY_COLORS[issue.priority] || 'text-zinc-300'
          }`}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </td>

      {/* Assignee */}
      <td className="py-3.5 px-4 text-zinc-300 font-medium">
        <span className="text-[11px]">
          {issue.assignee?.name || <span className="text-zinc-500 italic">Unassigned</span>}
        </span>
      </td>

      {/* Reporter */}
      <td className="py-3.5 px-4 text-zinc-400">
        <span className="text-[11px]">{issue.reporter?.name || 'Unknown'}</span>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(issue)}
            className="h-7 text-xs text-zinc-400 hover:text-white px-2"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(issue)}
            className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2"
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
