import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useIssues } from '@/hooks/useIssues';
import IssueFilters from '@/components/issue/IssueFilters';
import IssueTable from '@/components/issue/IssueTable';
import IssueFormDialog from '@/components/issue/IssueFormDialog';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, Search, FilterX } from 'lucide-react';

export default function ProjectIssues() {
  const { projectId } = useParams();
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
          <h2 className="text-lg font-bold text-zinc-100">Project Issues</h2>
          <p className="text-xs text-zinc-400">
            {totalIssues} issue{totalIssues === 1 ? '' : 's'} total
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Issue
        </Button>
      </div>

      {/* Filters Bar */}
      <IssueFilters />

      {/* Content States */}
      {isLoading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 space-y-3 animate-pulse">
          <div className="h-6 bg-zinc-800 rounded w-1/4" />
          <div className="h-10 bg-zinc-800 rounded w-full" />
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
        hasFiltersActive ? (
          /* Empty state: Filters match nothing */
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">No issues match your filters</h3>
            <p className="text-xs text-zinc-400">Try clearing your search query or status/priority filters.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs flex items-center gap-1 mx-auto"
            >
              <FilterX className="w-3.5 h-3.5" />
              Clear All Filters
            </Button>
          </div>
        ) : (
          /* Empty state: Project has zero issues */
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">No Issues Created Yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Get started by creating your first issue to assign tasks and track resolution status.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold mx-auto flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
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
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800">
              <span>
                Page <strong className="text-zinc-200">{page}</strong> of <strong className="text-zinc-200">{totalPages}</strong>
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

      <IssueFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        projectId={projectId}
        mode="create"
      />
    </div>
  );
}
