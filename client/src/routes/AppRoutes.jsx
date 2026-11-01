import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from './ProtectedRoute';

const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Projects = lazy(() => import('../pages/Projects'));
const ProjectDetails = lazy(() => import('../pages/ProjectDetails'));
const ProjectOverviewTab = lazy(() => import('../components/project/ProjectOverviewTab'));
const ProjectIssues = lazy(() => import('../pages/ProjectIssues'));
const KanbanBoard = lazy(() => import('../components/kanban/KanbanBoard'));
const ProjectMembersTab = lazy(() => import('../components/project/ProjectMembersTab'));
const IssueDetails = lazy(() => import('../pages/IssueDetails'));
const ProjectActivityTab = lazy(() => import('../components/project/ProjectActivityTab'));
const Issues = lazy(() => import('../pages/Issues'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));

function RouteLoadingFallback() {
  return (
    <div className="h-full min-h-[450px] w-full flex items-center justify-center bg-zinc-950 text-zinc-300">
      <div className="flex flex-col items-center gap-4 max-w-xs text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg font-mono font-bold text-xs text-zinc-200">
            TF
          </div>
          <div className="absolute -inset-1 rounded-2xl border border-zinc-700/50 animate-ping opacity-25" />
          <div className="absolute -inset-2 rounded-2xl border border-zinc-600/30 animate-pulse" />
        </div>
        <div className="space-y-1.5 w-full">
          <div className="h-1 w-32 mx-auto bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-200 rounded-full w-1/2 animate-[pulse_1s_ease-in-out_infinite]" />
          </div>
          <p className="text-[11px] font-mono text-zinc-400 tracking-wide">Synchronizing workspace...</p>
        </div>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/profile" element={<Profile />} />

            {/* Project Details Nested Routes */}
            <Route path="/projects/:projectId" element={<ProjectDetails />}>
              <Route index element={<ProjectOverviewTab />} />
              <Route path="board" element={<KanbanBoardWrapper />} />
              <Route path="issues" element={<ProjectIssues />} />
              <Route path="issues/:issueId" element={<IssueDetails />} />
              <Route path="members" element={<ProjectMembersTab />} />
              <Route path="activity" element={<ProjectActivityTab />} />
            </Route>

            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

// Small helper wrapper to pass projectId to KanbanBoard from params
function KanbanBoardWrapper() {
  const { projectId } = useParams();
  return <KanbanBoard projectId={projectId} />;
}
