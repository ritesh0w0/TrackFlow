import { useQuery } from '@tanstack/react-query';
import { getProjectActivity } from '@/services/activity.api';

export function useProjectActivity(projectId) {
  return useQuery({
    queryKey: ['activity', projectId],
    queryFn: () => getProjectActivity(projectId),
    enabled: !!projectId,
  });
}
