import { Link } from 'react-router-dom';
import PriorityBadge from '@/components/issue/PriorityBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function KanbanCard({ issue, projectId, onStatusChange }) {
  const isOverdue =
    issue.dueDate &&
    new Date(issue.dueDate) < new Date() &&
    issue.status !== 'DONE';

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-3.5 shadow-xs space-y-3 transition-all hover:shadow-md group">
      {/* Top row: Priority & Quick Move Menu */}
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={issue.priority} />

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-zinc-400 hover:text-white rounded"
                title="Move status"
              >
                <span className="text-xs">⋮</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-zinc-900 border-zinc-800 text-xs">
              <div className="px-2 py-1 text-[10px] text-zinc-500 font-semibold uppercase">
                Move to
              </div>
              {issue.status !== 'TODO' && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(issue.id, 'TODO')}
                  className="cursor-pointer text-zinc-300 focus:bg-zinc-800"
                >
                  To Do
                </DropdownMenuItem>
              )}
              {issue.status !== 'IN_PROGRESS' && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(issue.id, 'IN_PROGRESS')}
                  className="cursor-pointer text-amber-400 focus:bg-zinc-800"
                >
                  In Progress
                </DropdownMenuItem>
              )}
              {issue.status !== 'DONE' && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(issue.id, 'DONE')}
                  className="cursor-pointer text-emerald-400 focus:bg-zinc-800"
                >
                  Done
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title */}
      <Link
        to={`/projects/${projectId}/issues/${issue.id}`}
        className="text-xs font-semibold text-zinc-200 hover:text-white line-clamp-2 transition-colors block"
      >
        {issue.title}
      </Link>

      {/* Tags */}
      {issue.tags && issue.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {issue.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-zinc-950 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Due date & Assignee */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
        {issue.dueDate ? (
          <span
            className={`font-mono text-[10px] ${
              isOverdue ? 'text-rose-400 font-bold' : 'text-zinc-500'
            }`}
            title={isOverdue ? 'Overdue' : 'Due date'}
          >
            {isOverdue ? '⚠️ ' : '📅 '}
            {new Date(issue.dueDate).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-zinc-600 text-[10px]">No date</span>
        )}

        <div className="flex items-center gap-1.5">
          {issue.comments && issue.comments.length > 0 && (
            <span className="text-[10px] text-zinc-500 flex items-center gap-0.5" title="Comments">
              💬 {issue.comments.length}
            </span>
          )}
          <span
            className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-1.5 py-0.5 rounded truncate max-w-[90px] font-medium"
            title={`Assignee: ${issue.assignee?.name || 'Unassigned'}`}
          >
            {issue.assignee?.name || 'Unassigned'}
          </span>
        </div>
      </div>
    </div>
  );
}
