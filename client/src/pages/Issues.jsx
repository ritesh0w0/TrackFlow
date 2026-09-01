import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAllIssues } from '@/hooks/useIssues';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import IssueTable from '@/components/issue/IssueTable';
import IssueFormDialog from '@/components/issue/IssueFormDialog';
import { Button } from '@/components/ui/button';

export default function Issues() {
  const { user } = useAuth();
  const { data: projects = [] } = useProjects();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const assigneeId = searchParams.get('assigneeId') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const filterParams = {
    status: status || undefined,
    priority: priority || undefined,
    assigneeId: assigneeId || undefined,
    search: search || undefined,
    page,
    limit: 15,
  };

  const { data, isLoading, isError, error, refetch } = useAllIssues(filterParams);

  const issues = data?.issues || [];
  const totalPages = data?.pages || 1;
  const totalIssues = data?.total || 0;

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const setPage = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const hasFilters = Boolean(status || priority || assigneeId || search);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">All Issues</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Global issues tracker across all active projects ({totalIssues} total)
          </p>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSelectedProjectId(projects[0]?.id || '');
                setIsCreateOpen(true);
              }}
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold"
            >
              + New Issue
            </Button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-md text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-md text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => handleFilterChange('assigneeId', e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-md text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="">All Assignees</option>
              <option value="me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="text-xs text-zinc-400 hover:text-white h-7 px-2"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 space-y-3 animate-pulse">
          <div className="h-6 bg-zinc-800 rounded w-1/4" />
          <div className="h-10 bg-zinc-800 rounded w-full" />
          <div className="h-10 bg-zinc-800 rounded w-full" />
        </div>
      ) : isError ? (
        <div className="bg-red-950/50 border border-red-800 p-6 rounded-lg text-center space-y-3">
          <p className="text-sm font-medium text-red-300">
            Failed to load issues: {error?.response?.data?.message || error?.message || 'Server error'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-700 text-red-300 hover:bg-red-900 text-xs">
            Try Again
          </Button>
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center space-y-3">
          <div className="text-2xl">🎯</div>
          <h3 className="text-sm font-bold text-zinc-100">
            {hasFilters ? 'No issues match the selected filters' : 'No issues found across your projects'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {hasFilters
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'Create an issue inside a project to start tracking your work.'}
          </p>
          {hasFilters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
            >
              Reset Filters
            </Button>
          ) : projects.length > 0 ? (
            <Button
              onClick={() => {
                setSelectedProjectId(projects[0]?.id || '');
                setIsCreateOpen(true);
              }}
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold mt-2"
            >
              Create Issue
            </Button>
          ) : (
            <Link to="/projects">
              <Button className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold mt-2">
                Create Project First
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <IssueTable issues={issues} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-800">
              <span>
                Page <strong className="text-zinc-200">{page}</strong> of{' '}
                <strong className="text-zinc-200">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs h-8"
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs h-8"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedProjectId && (
        <IssueFormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          projectId={selectedProjectId}
          mode="create"
        />
      )}
    </div>
  );
}
