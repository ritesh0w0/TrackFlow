import { FolderGit2 } from 'lucide-react';

export default function EmptyState({
  title,
  message,
  icon,
  actionButton,
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-10 text-center space-y-3 max-w-md mx-auto my-6 shadow-xs">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 mx-auto">
        {icon || <FolderGit2 className="w-6 h-6 text-zinc-400" />}
      </div>
      <h3 className="text-base font-bold text-zinc-100">{title}</h3>
      {message && <p className="text-xs text-zinc-400 leading-relaxed">{message}</p>}
      {actionButton && <div className="pt-2">{actionButton}</div>}
    </div>
  );
}
