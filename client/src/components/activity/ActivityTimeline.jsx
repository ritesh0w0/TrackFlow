import { useProjectActivity } from '@/hooks/useActivity';
import ActivityItem from './ActivityItem';
import { Button } from '@/components/ui/button';

export default function ActivityTimeline({ projectId }) {
  const { data: activity = [], isLoading, isError, error, refetch } = useProjectActivity(projectId);

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-32" />
        <div className="h-10 bg-slate-800 rounded w-full" />
        <div className="h-10 bg-slate-800 rounded w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-950/50 border border-red-800 p-6 rounded-lg text-center space-y-3">
        <p className="text-xs font-medium text-red-300">
          Failed to load activity: {error?.response?.data?.message || error?.message || 'Server error'}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-700 text-red-300 text-xs h-7">
          Try Again
        </Button>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center text-xs text-slate-500">
        No project activity logged yet.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
      <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
        Project Activity Log
      </h3>
      <div className="pt-2">
        {activity.map((item) => (
          <ActivityItem key={item.id} activity={item} />
        ))}
      </div>
    </div>
  );
}
