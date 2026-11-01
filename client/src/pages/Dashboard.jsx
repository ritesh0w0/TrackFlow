import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useProjectDashboard } from '@/hooks/useDashboard';
import StatCard from '@/components/dashboard/StatCard';
import IssueStatusChart from '@/components/dashboard/IssueStatusChart';
import PriorityChart from '@/components/dashboard/PriorityChart';
import WorkloadChart from '@/components/dashboard/WorkloadChart';
import RecentIssues from '@/components/dashboard/RecentIssues';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, Zap, AlertTriangle, FolderGit2 } from 'lucide-react';

export default function Dashboard() {
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const [userSelectedProjectId, setUserSelectedProjectId] = useState('');

  // PERF-05: Derive active project ID immediately without useEffect waterfall
  const activeProjectId = userSelectedProjectId || (projects.length > 0 ? projects[0].id : '');

  const {
    data: dashboardData,
    isLoading: loadingDashboard,
    isError,
    error,
    refetch,
  } = useProjectDashboard(activeProjectId);

  if (loadingProjects) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-zinc-800 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-zinc-900 border border-zinc-800 rounded-lg" />
          <div className="h-24 bg-zinc-900 border border-zinc-800 rounded-lg" />
          <div className="h-24 bg-zinc-900 border border-zinc-800 rounded-lg" />
          <div className="h-24 bg-zinc-900 border border-zinc-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center space-y-4 max-w-lg mx-auto mt-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
          <FolderGit2 className="w-6 h-6 text-zinc-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100">No Projects Found</h2>
        <p className="text-xs text-zinc-400">
          Create a project to start tracking issues, team workload, and intelligence metrics.
        </p>
        <Link to="/projects">
          <Button className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold mt-2">
            Create Your First Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Project Intelligence
            </h1>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono font-medium px-2 py-0.5 rounded">
              DASHBOARD
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time delivery velocity, workload, and resolution intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="project-select" className="text-xs text-zinc-400 font-medium shrink-0">
            Active Project:
          </label>
          <select
            id="project-select"
            value={activeProjectId}
            onChange={(e) => setUserSelectedProjectId(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 font-medium cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingDashboard ? (
        <DashboardSkeleton />
      ) : isError ? (
        <div className="bg-red-950/50 border border-red-800 p-6 rounded-lg text-center space-y-3">
          <p className="text-sm font-medium text-red-300">
            Failed to load dashboard data: {error?.response?.data?.message || error?.message || 'Server error'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-700 text-red-300 hover:bg-red-900 text-xs">
            Try Again
          </Button>
        </div>
      ) : dashboardData ? (
        <>
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Issues"
              value={dashboardData.stats?.totalIssues ?? 0}
              subtitle={`${dashboardData.stats?.openIssues ?? 0} Open • ${dashboardData.stats?.completedIssues ?? 0} Done`}
              icon={<Target className="w-5 h-5 text-zinc-400" />}
            />
            <StatCard
              title="Completion Rate"
              value={`${dashboardData.stats?.completion ?? 0}%`}
              subtitle={`${dashboardData.stats?.done ?? 0} of ${dashboardData.stats?.totalIssues ?? 0} Resolved`}
              icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            />
            <StatCard
              title="Avg Resolution"
              value={
                dashboardData.stats?.averageResolutionHours > 0
                  ? `${dashboardData.stats.averageResolutionHours}h`
                  : 'N/A'
              }
              subtitle="Hours to resolution"
              icon={<Zap className="w-5 h-5 text-amber-400" />}
            />
            <StatCard
              title="Overdue & Stale"
              value={
                (dashboardData.stats?.overdueCount || 0) +
                (dashboardData.stats?.staleCount || 0)
              }
              subtitle={`${dashboardData.stats?.overdueCount || 0} overdue • ${dashboardData.stats?.staleCount || 0} stale`}
              icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
            />
          </div>

          {/* Charts Row: Status & Priority Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IssueStatusChart stats={dashboardData.stats} />
            <PriorityChart priority={dashboardData.priority} />
          </div>

          {/* Workload Distribution Chart */}
          <WorkloadChart workload={dashboardData.workloadDistribution} />

          {/* Bottom Lists: Recent Issues & Activity Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentIssues issues={dashboardData.recentIssues} projectId={activeProjectId} />
            <RecentActivity activity={dashboardData.recentActivity} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-start justify-between shadow-xs">
            <div className="space-y-2.5 w-3/4">
              <div className="h-3 w-20 bg-zinc-800 rounded" />
              <div className="h-7 w-16 bg-zinc-800/80 rounded" />
              <div className="h-2.5 w-28 bg-zinc-800/60 rounded" />
            </div>
            <div className="w-10 h-10 rounded-md bg-zinc-800/60 border border-zinc-700/40" />
          </div>
        ))}
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="h-4 w-32 bg-zinc-800 rounded" />
            <div className="h-3 w-16 bg-zinc-800/60 rounded" />
          </div>
          <div className="h-56 bg-zinc-950/40 border border-dashed border-zinc-800/60 rounded flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-zinc-800 border-t-zinc-600 animate-spin opacity-40" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="h-4 w-36 bg-zinc-800 rounded" />
            <div className="h-3 w-20 bg-zinc-800/60 rounded" />
          </div>
          <div className="h-56 bg-zinc-950/40 border border-dashed border-zinc-800/60 rounded flex items-end justify-around p-4 gap-4">
            <div className="w-10 bg-zinc-800/70 rounded-t h-16" />
            <div className="w-10 bg-zinc-800/70 rounded-t h-32" />
            <div className="w-10 bg-zinc-800/70 rounded-t h-24" />
            <div className="w-10 bg-zinc-800/70 rounded-t h-12" />
          </div>
        </div>
      </div>

      {/* Workload Distribution */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3">
        <div className="h-4 w-44 bg-zinc-800 rounded" />
        <div className="h-24 bg-zinc-950/40 border border-dashed border-zinc-800/60 rounded" />
      </div>

      {/* Bottom Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3">
          <div className="h-4 w-28 bg-zinc-800 rounded" />
          <div className="space-y-2">
            <div className="h-8 bg-zinc-800/60 rounded" />
            <div className="h-8 bg-zinc-800/60 rounded" />
            <div className="h-8 bg-zinc-800/60 rounded" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3">
          <div className="h-4 w-28 bg-zinc-800 rounded" />
          <div className="space-y-2">
            <div className="h-8 bg-zinc-800/60 rounded" />
            <div className="h-8 bg-zinc-800/60 rounded" />
            <div className="h-8 bg-zinc-800/60 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
