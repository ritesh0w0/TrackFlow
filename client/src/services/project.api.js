import api from './api';

export async function getProjects() {
  const response = await api.get('/projects');
  return response.data?.data || response.data;
}

export async function getProject(id) {
  const response = await api.get(`/projects/${id}`);
  return response.data?.data || response.data;
}

export async function createProject(data) {
  const response = await api.post('/projects', data);
  return response.data?.data || response.data;
}

export async function updateProject(id, data) {
  const response = await api.patch(`/projects/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteProject(id) {
  const response = await api.delete(`/projects/${id}`);
  return response.data?.data || response.data;
}

// Project Member API
export async function getProjectMembers(projectId) {
  const response = await api.get(`/projects/${projectId}/members`);
  return response.data?.data || response.data;
}

export async function addProjectMember(projectId, data) {
  const response = await api.post(`/projects/${projectId}/members`, data);
  return response.data?.data || response.data;
}

export async function updateProjectMemberRole(projectId, memberId, data) {
  const response = await api.patch(`/projects/${projectId}/members/${memberId}`, data);
  return response.data?.data || response.data;
}

export async function removeProjectMember(projectId, memberId) {
  const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
  return response.data?.data || response.data;
}
