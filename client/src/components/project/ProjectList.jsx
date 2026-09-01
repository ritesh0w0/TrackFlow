import ProjectCard from './ProjectCard';

export default function ProjectList({ projects, currentUserId }) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
