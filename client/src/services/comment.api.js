import api from './api';

export async function getComments(issueId) {
  const response = await api.get(`/issues/${issueId}/comments`);
  return response.data?.data || response.data;
}

export async function createComment(issueId, data) {
  const response = await api.post(`/issues/${issueId}/comments`, data);
  return response.data?.data || response.data;
}

export async function updateComment(commentId, data) {
  const response = await api.patch(`/comments/${commentId}`, data);
  return response.data?.data || response.data;
}

export async function deleteComment(commentId) {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data?.data || response.data;
}
