import api from './api';

export async function getProjectDashboard(projectId) {
  const response = await api.get(`/projects/${projectId}/dashboard`);
  return response.data?.data || response.data;
}
