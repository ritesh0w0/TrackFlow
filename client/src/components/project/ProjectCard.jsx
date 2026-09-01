import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProjectFormDialog from './ProjectFormDialog';
import DeleteProjectDialog from './DeleteProjectDialog';

export default function ProjectCard({ project, currentUserId }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isOwner = project.createdById === currentUserId;

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors group shadow-xs">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/projects/${project.id}`}
              className="text-base font-bold text-zinc-100 group-hover:text-white hover:underline transition-colors line-clamp-1"
            >
              {project.title || project.name}
            </Link>
            {isOwner && (
              <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded font-mono font-medium">
                OWNER
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2rem]">
            {project.description || 'No description provided.'}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-500 text-[11px] font-mono">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 px-2"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2"
            >
              Delete
            </Button>
            <Link to={`/projects/${project.id}`}>
              <Button size="sm" className="h-7 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5">
                Open →
              </Button>
            </Link>
          </div>
        </div>
      </div>

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
      />
    </>
  );
}
