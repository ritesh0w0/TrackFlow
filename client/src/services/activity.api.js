import api from './api';

export async function getProjectActivity(projectId) {
  const response = await api.get(`/projects/${projectId}/activity`);
  return response.data?.data || response.data;
}
