import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function IssueFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = search || status || priority;

  return (
    <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-lg">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Search issues by title..."
          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Status Filter */}
      <div>
        <select
          value={status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="bg-slate-950 border border-slate-800 text-white text-xs rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      {/* Priority Filter */}
      <div>
        <select
          value={priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="bg-slate-950 border border-slate-800 text-white text-xs rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Clear CTA */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs text-slate-400 hover:text-white px-2 h-8"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
