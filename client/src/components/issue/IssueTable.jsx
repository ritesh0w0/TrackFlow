import { useState } from 'react';
import IssueRow from './IssueRow';
import IssueFormDialog from './IssueFormDialog';
import DeleteIssueDialog from './DeleteIssueDialog';

export default function IssueTable({ issues, projectId }) {
  // PERF-08: Hoist dialogs out of IssueRow to avoid mounting N dialogs
  const [editingIssue, setEditingIssue] = useState(null);
  const [deletingIssue, setDeletingIssue] = useState(null);

  if (!issues || issues.length === 0) {
    return null;
  }

  const showProjectColumn = !projectId;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Issue</th>
              {showProjectColumn && <th className="py-3 px-4 font-semibold">Project</th>}
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Priority</th>
              <th className="py-3 px-4 font-semibold">Assignee</th>
              <th className="py-3 px-4 font-semibold">Reporter</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {issues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                projectId={projectId}
                showProject={showProjectColumn}
                onEdit={(iss) => setEditingIssue(iss)}
                onDelete={(iss) => setDeletingIssue(iss)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Hoisted Dialogs - mounted once per table rather than once per row */}
      {editingIssue && (
        <IssueFormDialog
          open={!!editingIssue}
          onOpenChange={(open) => {
            if (!open) setEditingIssue(null);
          }}
          projectId={projectId || editingIssue.projectId}
          initialValues={editingIssue}
          mode="edit"
        />
      )}

      {deletingIssue && (
        <DeleteIssueDialog
          open={!!deletingIssue}
          onOpenChange={(open) => {
            if (!open) setDeletingIssue(null);
          }}
          issue={deletingIssue}
        />
      )}
    </div>
  );
}
