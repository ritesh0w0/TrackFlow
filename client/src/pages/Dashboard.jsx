import { useState, useEffect } from 'react';
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

export default function Dashboard() {
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const {
    data: dashboardData,
    isLoading: loadingDashboard,
    isError,
    error,
    refetch,
  } = useProjectDashboard(selectedProjectId);

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
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-300 font-bold text-xl border border-zinc-700">
          📁
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
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          <div className="h-24 bg-zinc-900 rounded-lg border border-zinc-800" />
          <div className="h-24 bg-zinc-900 rounded-lg border border-zinc-800" />
          <div className="h-24 bg-zinc-900 rounded-lg border border-zinc-800" />
          <div className="h-24 bg-zinc-900 rounded-lg border border-zinc-800" />
        </div>
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
              icon="🎯"
            />
            <StatCard
              title="Completion Rate"
              value={`${dashboardData.stats?.completion ?? 0}%`}
              subtitle={`${dashboardData.stats?.done ?? 0} of ${dashboardData.stats?.totalIssues ?? 0} Resolved`}
              icon="📈"
            />
            <StatCard
              title="Avg Resolution"
              value={
                dashboardData.stats?.averageResolutionHours > 0
                  ? `${dashboardData.stats.averageResolutionHours}h`
                  : 'N/A'
              }
              subtitle="Hours to resolution"
              icon="⚡"
            />
            <StatCard
              title="Overdue & Stale"
              value={
                (dashboardData.stats?.overdueCount || 0) +
                (dashboardData.stats?.staleCount || 0)
              }
              subtitle={`${dashboardData.stats?.overdueCount || 0} overdue • ${dashboardData.stats?.staleCount || 0} stale`}
              icon="⚠️"
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
            <RecentIssues issues={dashboardData.recentIssues} projectId={selectedProjectId} />
            <RecentActivity activity={dashboardData.recentActivity} />
          </div>
        </>
      ) : null}
    </div>
  );
}
