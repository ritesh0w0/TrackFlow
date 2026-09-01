import { useState } from 'react';
import { useParams, Link, Outlet, useLocation } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import ProjectFormDialog from '@/components/project/ProjectFormDialog';
import DeleteProjectDialog from '@/components/project/DeleteProjectDialog';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const location = useLocation();
  const { data: project, isLoading, isError, error, refetch } = useProject(projectId);
  const { user } = useAuth();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-20 bg-zinc-900 border border-zinc-800 rounded-lg" />
        <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-lg" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="bg-red-950/50 border border-red-800 p-8 rounded-lg text-center space-y-4 max-w-lg mx-auto mt-12">
        <h2 className="text-lg font-bold text-red-200">Error Loading Project</h2>
        <p className="text-xs text-red-300">
          {error?.response?.data?.message || error?.message || 'Project not found or access denied.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/projects">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 text-xs">
              Back to Projects
            </Button>
          </Link>
          <Button onClick={() => refetch()} size="sm" className="bg-red-600 hover:bg-red-500 text-white text-xs">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = project.createdById === user?.id || project.currentUserRole === 'OWNER';
  const isAdmin = project.currentUserRole === 'ADMIN' || isOwner;

  const currentTab = location.pathname.endsWith('/issues')
    ? 'issues'
    : location.pathname.endsWith('/board')
    ? 'board'
    : location.pathname.endsWith('/members')
    ? 'members'
    : location.pathname.endsWith('/activity')
    ? 'activity'
    : 'overview';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="space-y-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Link to="/projects" className="hover:text-zinc-200 transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-zinc-200">{project.title || project.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                {project.title || project.name}
              </h1>
              {isOwner ? (
                <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded font-mono font-medium">
                  OWNER
                </span>
              ) : project.currentUserRole ? (
                <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded font-mono font-medium">
                  {project.currentUserRole}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs"
              >
                Edit Project
              </Button>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteOpen(true)}
                  className="bg-zinc-900 border-zinc-800 text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 text-xs"
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Project Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pt-2 -mb-5 overflow-x-auto">
          <Link
            to={`/projects/${projectId}`}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors shrink-0 ${
              currentTab === 'overview'
                ? 'border-zinc-100 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Overview
          </Link>
          <Link
            to={`/projects/${projectId}/board`}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors shrink-0 ${
              currentTab === 'board'
                ? 'border-zinc-100 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Kanban Board
          </Link>
          <Link
            to={`/projects/${projectId}/issues`}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors shrink-0 ${
              currentTab === 'issues'
                ? 'border-zinc-100 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Issues List
          </Link>
          <Link
            to={`/projects/${projectId}/members`}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors shrink-0 ${
              currentTab === 'members'
                ? 'border-zinc-100 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Team Members
          </Link>
          <Link
            to={`/projects/${projectId}/activity`}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors shrink-0 ${
              currentTab === 'activity'
                ? 'border-zinc-100 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Activity
          </Link>
        </div>
      </div>

      {/* Sub-route Content */}
      <div className="pt-2">
        <Outlet context={{ project, isOwner, isAdmin }} />
      </div>

      {/* Modals */}
      <ProjectFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialValues={project}
        mode="edit"
      />

      <DeleteProjectDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        project={project}
        redirectOnDelete={true}
      />
    </div>
  );
}
