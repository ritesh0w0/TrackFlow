import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as commentApi from '@/services/comment.api';

export function useComments(issueId) {
  return useQuery({
    queryKey: ['comments', issueId],
    queryFn: () => commentApi.getComments(issueId),
    enabled: !!issueId,
  });
}

// PERF-07: Refined query invalidations to avoid blanket dashboard re-fetches
export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, data }) => commentApi.createComment(issueId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.issueId] });
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: ['activity', variables.projectId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['activity'] });
      }
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, data }) => commentApi.updateComment(commentId, data),
    onSuccess: (_, variables) => {
      if (variables?.issueId) {
        queryClient.invalidateQueries({ queryKey: ['comments', variables.issueId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commentApi.deleteComment,
    onSuccess: (_, variables) => {
      if (variables?.issueId) {
        queryClient.invalidateQueries({ queryKey: ['comments', variables.issueId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    },
  });
}
