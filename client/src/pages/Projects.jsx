import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import ProjectList from '@/components/project/ProjectList';
import ProjectFormDialog from '@/components/project/ProjectFormDialog';
import { Button } from '@/components/ui/button';

export default function Projects() {
  const { data: projects = [], isLoading, isError, error, refetch } = useProjects();
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Projects</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage and track workspace projects</p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold"
        >
          + New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-pulse">
          <div className="h-40 bg-zinc-900 border border-zinc-800 rounded-lg" />
          <div className="h-40 bg-zinc-900 border border-zinc-800 rounded-lg" />
          <div className="h-40 bg-zinc-900 border border-zinc-800 rounded-lg" />
        </div>
      ) : isError ? (
        <div className="bg-red-950/50 border border-red-800 p-6 rounded-lg text-center space-y-3">
          <p className="text-sm font-medium text-red-300">
            Failed to load projects: {error?.response?.data?.message || error?.message || 'Server error'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-700 text-red-300 hover:bg-red-900 text-xs">
            Try Again
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center space-y-4 max-w-md mx-auto mt-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-300 font-bold text-xl border border-zinc-700">
            📁
          </div>
          <h3 className="text-lg font-bold text-zinc-100">No Projects Yet</h3>
          <p className="text-xs text-zinc-400">
            You don&apos;t have any active projects in this workspace yet. Create one to get started.
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold mt-2"
          >
            Create Your First Project
          </Button>
        </div>
      ) : (
        <ProjectList projects={projects} currentUserId={user?.id} />
      )}

      <ProjectFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} mode="create" />
    </div>
  );
}
