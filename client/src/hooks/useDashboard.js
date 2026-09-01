import { useQuery } from '@tanstack/react-query';
import { getProjectDashboard } from '@/services/dashboard.api';

export function useProjectDashboard(projectId) {
  return useQuery({
    queryKey: ['dashboard', projectId],
    queryFn: () => getProjectDashboard(projectId),
    enabled: !!projectId,
  });
}
