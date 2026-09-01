import api from './api';

export async function getIssues(projectId, params = {}) {
  const response = await api.get(`/projects/${projectId}/issues`, { params });
  return response.data?.data || response.data;
}

export async function getAllIssues(params = {}) {
  const response = await api.get('/issues', { params });
  return response.data?.data || response.data;
}

export async function getIssue(issueId) {
  const response = await api.get(`/issues/${issueId}`);
  return response.data?.data || response.data;
}

export async function createIssue(projectId, data) {
  const response = await api.post(`/projects/${projectId}/issues`, data);
  return response.data?.data || response.data;
}

export async function updateIssue(issueId, data) {
  const response = await api.patch(`/issues/${issueId}`, data);
  return response.data?.data || response.data;
}

export async function deleteIssue(issueId) {
  const response = await api.delete(`/issues/${issueId}`);
  return response.data?.data || response.data;
}

export async function assignIssue(issueId, assigneeId) {
  const response = await api.patch(`/issues/${issueId}/assign`, { assigneeId });
  return response.data?.data || response.data;
}

export async function updateIssueStatus(issueId, status) {
  const response = await api.patch(`/issues/${issueId}/status`, { status });
  return response.data?.data || response.data;
}

export async function updateIssuePriority(issueId, priority) {
  const response = await api.patch(`/issues/${issueId}/priority`, { priority });
  return response.data?.data || response.data;
}
