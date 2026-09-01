import KanbanCard from './KanbanCard';
import { Button } from '@/components/ui/button';

const COLUMN_CONFIG = {
  TODO: {
    title: 'To Do',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    dotClass: 'bg-zinc-400',
  },
  IN_PROGRESS: {
    title: 'In Progress',
    badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-800',
    dotClass: 'bg-amber-500',
  },
  DONE: {
    title: 'Done',
    badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
    dotClass: 'bg-emerald-500',
  },
};

export default function KanbanColumn({
  status,
  issues = [],
  projectId,
  onStatusChange,
  onCreateIssue,
}) {
  const config = COLUMN_CONFIG[status] || {
    title: status,
    badgeClass: 'bg-zinc-800 text-zinc-300',
    dotClass: 'bg-zinc-400',
  };

  return (
    <div className="flex flex-col bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 min-w-[280px] sm:min-w-[320px] flex-1">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${config.dotClass}`} />
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">{config.title}</h3>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
            {issues.length}
          </span>
        </div>

        {onCreateIssue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCreateIssue(status)}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
            title={`Add issue to ${config.title}`}
          >
            +
          </Button>
        )}
      </div>

      {/* Cards List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto min-h-[200px] max-h-[calc(100vh-280px)] pr-1 scrollbar-thin">
        {issues.length === 0 ? (
          <div className="h-32 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-600 text-xs gap-1">
            <span>No issues</span>
          </div>
        ) : (
          issues.map((issue) => (
            <KanbanCard
              key={issue.id}
              issue={issue}
              projectId={projectId}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
