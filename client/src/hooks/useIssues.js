import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as issueApi from '@/services/issue.api';

export function useIssues(projectId, filters = {}) {
  return useQuery({
    queryKey: ['issues', projectId, filters],
    queryFn: () => issueApi.getIssues(projectId, filters),
    enabled: !!projectId,
  });
}

export function useAllIssues(filters = {}) {
  return useQuery({
    queryKey: ['all-issues', filters],
    queryFn: () => issueApi.getAllIssues(filters),
  });
}

export function useIssue(issueId) {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: () => issueApi.getIssue(issueId),
    enabled: !!issueId,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }) => issueApi.createIssue(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity', variables.projectId] });
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, data }) => issueApi.updateIssue(issueId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
      if (data?.id) queryClient.invalidateQueries({ queryKey: ['issues', data.id] });
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['dashboard', data.projectId] });
        queryClient.invalidateQueries({ queryKey: ['activity', data.projectId] });
      }
    },
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueApi.deleteIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useAssignIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, assigneeId }) => issueApi.assignIssue(issueId, assigneeId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
      if (data?.id) queryClient.invalidateQueries({ queryKey: ['issues', data.id] });
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['dashboard', data.projectId] });
        queryClient.invalidateQueries({ queryKey: ['activity', data.projectId] });
      }
    },
  });
}

export function useUpdateIssueStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, status }) => issueApi.updateIssueStatus(issueId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
      if (data?.id) queryClient.invalidateQueries({ queryKey: ['issues', data.id] });
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['dashboard', data.projectId] });
        queryClient.invalidateQueries({ queryKey: ['activity', data.projectId] });
      }
    },
  });
}

export function useUpdateIssuePriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, priority }) => issueApi.updateIssuePriority(issueId, priority),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
      if (data?.id) queryClient.invalidateQueries({ queryKey: ['issues', data.id] });
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['dashboard', data.projectId] });
        queryClient.invalidateQueries({ queryKey: ['activity', data.projectId] });
      }
    },
  });
}
