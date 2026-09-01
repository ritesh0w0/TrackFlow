export default function EmptyState({ title, message, icon = '📁', actionButton }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-10 text-center space-y-3 max-w-md mx-auto my-6">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-indigo-400 font-bold text-xl">
        {icon}
      </div>
      <h3 className="text-base font-bold text-white">{title}</h3>
      {message && <p className="text-xs text-slate-400 leading-relaxed">{message}</p>}
      {actionButton && <div className="pt-2">{actionButton}</div>}
    </div>
  );
}
