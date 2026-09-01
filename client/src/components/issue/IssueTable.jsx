import IssueRow from './IssueRow';

export default function IssueTable({ issues, projectId }) {
  if (!issues || issues.length === 0) {
    return null;
  }

  const showProjectColumn = !projectId;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Issue</th>
              {showProjectColumn && <th className="py-3 px-4 font-semibold">Project</th>}
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Priority</th>
              <th className="py-3 px-4 font-semibold">Assignee</th>
              <th className="py-3 px-4 font-semibold">Reporter</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {issues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                projectId={projectId}
                showProject={showProjectColumn}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
