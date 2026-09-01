const priorityConfig = {
  CRITICAL: { label: 'CRITICAL', className: 'bg-red-950/80 text-red-400 border-red-800' },
  HIGH: { label: 'HIGH', className: 'bg-orange-950/80 text-orange-400 border-orange-800' },
  MEDIUM: { label: 'MEDIUM', className: 'bg-yellow-950/80 text-yellow-400 border-yellow-800' },
  LOW: { label: 'LOW', className: 'bg-slate-800 text-slate-400 border-slate-700' },
};

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || { label: priority, className: 'bg-slate-800 text-slate-400' };

  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${config.className}`}>
      {config.label}
    </span>
  );
}
