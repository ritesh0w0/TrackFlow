import { useState } from 'react';
import { useIssues, useUpdateIssueStatus } from '@/hooks/useIssues';
import KanbanColumn from './KanbanColumn';
import IssueFormDialog from '@/components/issue/IssueFormDialog';
import { Button } from '@/components/ui/button';

export default function KanbanBoard({ projectId }) {
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('TODO');

  const { data, isLoading, isError, error, refetch } = useIssues(projectId, {
    limit: 100,
  });

  const statusMutation = useUpdateIssueStatus();

  const handleStatusChange = (issueId, newStatus) => {
    statusMutation.mutate({ issueId, status: newStatus });
  };

  const handleOpenCreateWithStatus = (status) => {
    setDefaultStatus(status || 'TODO');
    setIsCreateOpen(true);
  };

  const allIssues = data?.issues || [];

  // Filter issues client-side on the board for real-time responsiveness
  const filteredIssues = allIssues.filter((issue) => {
    if (priorityFilter && issue.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description?.toLowerCase().includes(q);
      const matchTags = issue.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const todoIssues = filteredIssues.filter((i) => i.status === 'TODO');
  const inProgressIssues = filteredIssues.filter((i) => i.status === 'IN_PROGRESS');
  const doneIssues = filteredIssues.filter((i) => i.status === 'DONE');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        <div className="h-96 bg-zinc-900 border border-zinc-800 rounded-xl" />
        <div className="h-96 bg-zinc-900 border border-zinc-800 rounded-xl" />
        <div className="h-96 bg-zinc-900 border border-zinc-800 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-950/50 border border-red-800 p-6 rounded-lg text-center space-y-3">
        <p className="text-sm font-medium text-red-300">
          Failed to load Kanban board: {error?.response?.data?.message || error?.message || 'Server error'}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-700 text-red-300 hover:bg-red-900 text-xs">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Board Controls / Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search board cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 w-48 sm:w-64"
          />

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-md text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {(searchQuery || priorityFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setPriorityFilter('');
              }}
              className="text-[11px] text-zinc-400 hover:text-white h-7 px-2"
            >
              Reset
            </Button>
          )}
        </div>

        <Button
          onClick={() => handleOpenCreateWithStatus('TODO')}
          className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold shrink-0"
        >
          + Add Issue
        </Button>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <KanbanColumn
          status="TODO"
          issues={todoIssues}
          projectId={projectId}
          onStatusChange={handleStatusChange}
          onCreateIssue={handleOpenCreateWithStatus}
        />
        <KanbanColumn
          status="IN_PROGRESS"
          issues={inProgressIssues}
          projectId={projectId}
          onStatusChange={handleStatusChange}
          onCreateIssue={handleOpenCreateWithStatus}
        />
        <KanbanColumn
          status="DONE"
          issues={doneIssues}
          projectId={projectId}
          onStatusChange={handleStatusChange}
          onCreateIssue={handleOpenCreateWithStatus}
        />
      </div>

      <IssueFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        projectId={projectId}
        mode="create"
      />
    </div>
  );
}
