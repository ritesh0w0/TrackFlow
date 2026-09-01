import { useOutletContext } from 'react-router-dom';
import ActivityTimeline from '@/components/activity/ActivityTimeline';

export default function ProjectActivityTab() {
  const { project } = useOutletContext();

  return (
    <div className="space-y-6">
      <ActivityTimeline projectId={project.id} />
    </div>
  );
}
