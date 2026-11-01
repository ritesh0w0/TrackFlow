import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, FilterX } from 'lucide-react';

export default function IssueFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParam = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';

  // PERF-06: Debounced local search state
  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      const params = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      setSearchParams(params, { replace: true });
    }
  }, [debouncedSearch, searchParams, setSearchParams]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = searchParam || status || priority;

  return (
    <div className="flex flex-wrap items-center gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xs">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px] relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search issues by title..."
          className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
      </div>

      {/* Status Filter */}
      <div>
        <select
          value={status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="bg-zinc-950 border border-zinc-700/80 text-zinc-200 text-xs rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
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
          className="bg-zinc-950 border border-zinc-700/80 text-zinc-200 text-xs rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
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
          className="text-xs text-zinc-400 hover:text-white px-2 h-8 flex items-center gap-1"
        >
          <FilterX className="w-3 h-3" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
