import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useIssue,
  useUpdateIssueStatus,
  useUpdateIssuePriority,
  useAssignIssue,
} from '@/hooks/useIssues';
import { useProjectMembers } from '@/hooks/useProjects';
import IssueFormDialog from '@/components/issue/IssueFormDialog';
import DeleteIssueDialog from '@/components/issue/DeleteIssueDialog';
import CommentList from '@/components/comment/CommentList';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function IssueDetails() {
  const { projectId, issueId } = useParams();
  const { data: issue, isLoading, isError, error, refetch } = useIssue(issueId);
  const targetProjectId = projectId || issue?.projectId;
  const { data: members = [] } = useProjectMembers(targetProjectId);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const statusMutation = useUpdateIssueStatus();
  const priorityMutation = useUpdateIssuePriority();
  const assignMutation = useAssignIssue();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-16 bg-zinc-900 border border-zinc-800 rounded-lg" />
        <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-lg" />
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div className="bg-red-950/50 border border-red-800 p-8 rounded-lg text-center space-y-4 max-w-lg mx-auto mt-12">
        <h2 className="text-lg font-bold text-red-200">Issue Not Found</h2>
        <p className="text-xs text-red-300">
          {error?.response?.data?.message || error?.message || 'The requested issue could not be loaded.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to={`/projects/${targetProjectId}/issues`}>
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 text-xs">
              Back to Issues
            </Button>
          </Link>
          <Button onClick={() => refetch()} size="sm" className="bg-red-600 hover:bg-red-500 text-white text-xs">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const handleStatusChange = (e) => {
    statusMutation.mutate({ issueId: issue.id, status: e.target.value });
  };

  const handlePriorityChange = (e) => {
    priorityMutation.mutate({ issueId: issue.id, priority: e.target.value });
  };

  const handleAssigneeChange = (e) => {
    const val = e.target.value;
    assignMutation.mutate({ issueId: issue.id, assigneeId: val === '' ? null : val });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumbs & Title bar */}
      <div className="space-y-3 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Link to="/projects" className="hover:text-zinc-200 transition-colors">
            Projects
          </Link>
          <span>/</span>
          <Link
            to={`/projects/${targetProjectId}/issues`}
            className="hover:text-zinc-200 transition-colors truncate max-w-[200px]"
          >
            {issue.project?.title || 'Project'}
          </Link>
          <span>/</span>
          <span className="text-zinc-200">#{issue.id.slice(0, 8)}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{issue.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Avatar className="h-4 w-4 border border-zinc-700">
                  <AvatarFallback className="bg-zinc-800 text-zinc-200 text-[8px]">
                    {(issue.reporter?.name || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                Reported by <strong className="text-zinc-200">{issue.reporter?.name || 'Unknown'}</strong>
              </span>
              <span>•</span>
              <span className="font-mono">Created {new Date(issue.createdAt).toLocaleDateString()}</span>
              {issue.resolvedAt && (
                <>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium font-mono">
                    Resolved {new Date(issue.resolvedAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs"
            >
              Edit Issue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="bg-zinc-900 border-zinc-800 text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 text-xs"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Description + Comments & Attributes Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Description & Comments */}
        <div className="md:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</h3>
            <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {issue.description || <span className="italic text-zinc-500">No description provided.</span>}
            </div>
          </div>

          {/* Tags Display */}
          {issue.tags && issue.tags.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2 shadow-xs">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tags & Labels</h3>
              <div className="flex flex-wrap gap-1.5">
                {issue.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-zinc-950 text-zinc-300 border border-zinc-800 px-2.5 py-1 rounded-md font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Thread */}
          <CommentList issueId={issue.id} />
        </div>

        {/* Right 1 Col: Attributes Sidebar */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4 text-xs shadow-xs">
            <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-[11px] border-b border-zinc-800 pb-2">
              Issue Attributes
            </h3>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="text-zinc-400 font-medium block">Status</label>
              <select
                value={issue.status}
                onChange={handleStatusChange}
                disabled={statusMutation.isPending}
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 font-medium cursor-pointer"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1">
              <label className="text-zinc-400 font-medium block">Priority</label>
              <select
                value={issue.priority}
                onChange={handlePriorityChange}
                disabled={priorityMutation.isPending}
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 font-medium cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Assignee Selector from Project Members */}
            <div className="space-y-1">
              <label className="text-zinc-400 font-medium block">Assignee</label>
              <select
                value={issue.assigneeId || ''}
                onChange={handleAssigneeChange}
                disabled={assignMutation.isPending}
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-zinc-400 font-medium block">Due Date</label>
              <p className="text-zinc-200 font-mono text-xs">
                {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'No due date'}
              </p>
            </div>

            {/* Project Link */}
            <div className="space-y-1 pt-2 border-t border-zinc-800">
              <label className="text-zinc-400 font-medium block">Project</label>
              <Link
                to={`/projects/${targetProjectId}`}
                className="text-zinc-300 hover:text-white hover:underline font-medium block truncate"
              >
                {issue.project?.title || 'Open Project Overview'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <IssueFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        projectId={targetProjectId}
        initialValues={issue}
        mode="edit"
      />

      <DeleteIssueDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        issue={issue}
        redirectOnDelete={true}
      />
    </div>
  );
}
