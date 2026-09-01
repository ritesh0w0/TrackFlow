export default function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-start justify-between shadow-xs">
      <div className="space-y-1">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-zinc-100 tracking-tight font-mono">{value}</p>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>
      {icon && (
        <div className="p-2.5 bg-zinc-800/80 rounded-md text-zinc-300 text-lg flex items-center justify-center border border-zinc-700/50">
          {icon}
        </div>
      )}
    </div>
  );
}
