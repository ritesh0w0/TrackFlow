const statusConfig = {
  TODO: { label: 'To Do', className: 'bg-slate-800 text-slate-300 border-slate-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-950/80 text-blue-400 border-blue-800' },
  DONE: { label: 'Done', className: 'bg-emerald-950/80 text-emerald-400 border-emerald-800' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'bg-slate-800 text-slate-400' };

  return (
    <span className={`px-2 py-0.5 rounded border text-[11px] font-mono font-medium inline-flex items-center gap-1 ${config.className}`}>
      <span>{config.label}</span>
    </span>
  );
}
