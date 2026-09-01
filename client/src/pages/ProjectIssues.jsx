import { useState } from 'react';
import { useParams, useSearchParams, useOutletContext } from 'react-router-dom';
import { useIssues } from '@/hooks/useIssues';
import IssueFilters from '@/components/issue/IssueFilters';
import IssueTable from '@/components/issue/IssueTable';
import IssueFormDialog from '@/components/issue/IssueFormDialog';
import { Button } from '@/components/ui/button';

export default function ProjectIssues() {
  const { projectId } = useParams();
  const outletContext = useOutletContext();
  const project = outletContext?.project;

  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const filterParams = {
    status: status || undefined,
    priority: priority || undefined,
    search: search || undefined,
    page,
    limit: 10,
  };

  const { data, isLoading, isError, error, refetch } = useIssues(projectId, filterParams);

  const issues = data?.issues || [];
  const totalPages = data?.pages || 1;
  const totalIssues = data?.total || 0;

  const hasFiltersActive = !!(status || priority || search);

  const setPage = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Project Issues</h2>
          <p className="text-xs text-slate-400">
            {totalIssues} issue{totalIssues === 1 ? '' : 's'} total
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
        >
          + Create Issue
        </Button>
      </div>

      {/* Filters Bar */}
      <IssueFilters />

      {/* Content States */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 space-y-3 animate-pulse">
          <div className="h-6 bg-slate-800 rounded w-1/4" />
          <div className="h-10 bg-slate-800 rounded w-full" />
          <div className="h-10 bg-slate-800 rounded w-full" />
          <div className="h-10 bg-slate-800 rounded w-full" />
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
        hasFiltersActive ? (
          /* Empty state: Filters match nothing */
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center space-y-3">
            <div className="text-2xl">🔍</div>
            <h3 className="text-sm font-bold text-white">No issues match your filters</h3>
            <p className="text-xs text-slate-400">Try clearing your search query or status/priority filters.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          /* Empty state: Project has zero issues */
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-indigo-400 font-bold text-xl">
              🎯
            </div>
            <h3 className="text-base font-bold text-white">No Issues Created Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Get started by creating your first issue to assign tasks and track resolution status.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
            >
              Create First Issue
            </Button>
          </div>
        )
      ) : (
        <>
          {/* Issue Table */}
          <IssueTable issues={issues} projectId={projectId} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>
                Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs h-8"
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs h-8"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <IssueFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        projectId={projectId}
        mode="create"
      />
    </div>
  );
}
