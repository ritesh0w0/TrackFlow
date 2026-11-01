import { useOutletContext } from 'react-router-dom';
import { useProjectDashboard } from '@/hooks/useDashboard';
import StatCard from '@/components/dashboard/StatCard';
import IssueStatusChart from '@/components/dashboard/IssueStatusChart';
import PriorityChart from '@/components/dashboard/PriorityChart';
import WorkloadChart from '@/components/dashboard/WorkloadChart';
import RecentIssues from '@/components/dashboard/RecentIssues';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

export default function ProjectOverviewTab() {
  const { project } = useOutletContext();
  const { data: dashboardData, isLoading, isError, error, refetch } = useProjectDashboard(project.id);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        <div className="h-24 bg-zinc-900 rounded-lg border border-zinc-800" />
        <div className="h-24 bg-zinc-900 rounded-lg border border-zinc-800" />
        <div className="h-24 bg-zinc-900 rounded-lg border border-zinc-800" />
        <div className="h-24 bg-zinc-900 rounded-lg border border-zinc-800" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-950/50 border border-red-800 p-6 rounded-lg text-center space-y-3">
        <p className="text-sm font-medium text-red-300">
          Failed to load project overview: {error?.response?.data?.message || error?.message || 'Server error'}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-700 text-red-300 hover:bg-red-900 text-xs">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Issues"
          value={dashboardData?.stats?.totalIssues ?? 0}
          subtitle={`${dashboardData?.stats?.openIssues ?? 0} Open • ${dashboardData?.stats?.completedIssues ?? 0} Done`}
          icon={<Target className="w-5 h-5 text-zinc-400" />}
        />
        <StatCard
          title="Completion Rate"
          value={`${dashboardData?.stats?.completion ?? 0}%`}
          subtitle={`${dashboardData?.stats?.done ?? 0} of ${dashboardData?.stats?.totalIssues ?? 0} Resolved`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Avg Resolution"
          value={
            dashboardData?.stats?.averageResolutionHours > 0
              ? `${dashboardData.stats.averageResolutionHours}h`
              : 'N/A'
          }
          subtitle="Hours to resolution"
          icon={<Zap className="w-5 h-5 text-amber-400" />}
        />
        <StatCard
          title="Overdue & Stale"
          value={
            (dashboardData?.stats?.overdueCount || 0) +
            (dashboardData?.stats?.staleCount || 0)
          }
          subtitle={`${dashboardData?.stats?.overdueCount || 0} overdue • ${dashboardData?.stats?.staleCount || 0} stale`}
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IssueStatusChart stats={dashboardData?.stats} />
        <PriorityChart priority={dashboardData?.priority} />
      </div>

      {/* Workload Distribution */}
      <WorkloadChart workload={dashboardData?.workloadDistribution} />

      {/* Bottom Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentIssues issues={dashboardData?.recentIssues} projectId={project.id} />
        <RecentActivity activity={dashboardData?.recentActivity} />
      </div>
    </div>
  );
}
