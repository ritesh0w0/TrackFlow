import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import ProjectOverviewTab from '../components/project/ProjectOverviewTab';
import ProjectIssues from '../pages/ProjectIssues';
import KanbanBoard from '../components/kanban/KanbanBoard';
import ProjectMembersTab from '../components/project/ProjectMembersTab';
import IssueDetails from '../pages/IssueDetails';
import ProjectActivityTab from '../components/project/ProjectActivityTab';
import Issues from '../pages/Issues';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';

export default function AppRoutes() {
  return (
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
  );
}

// Small helper wrapper to pass projectId to KanbanBoard from params
function KanbanBoardWrapper() {
  const { projectId } = useParams();
  return <KanbanBoard projectId={projectId} />;
}
