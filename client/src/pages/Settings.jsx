import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Settings() {
  const { user, logout } = useAuth();
  const { data: projects = [] } = useProjects();

  const handleCopyApiUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    navigator.clipboard.writeText(url);
    toast.success('API Base URL copied to clipboard');
  };

  const getInitials = (name) => {
    if (!name) return 'TF';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Settings & Account</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your developer profile, workspace configurations, and security preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            User Identity
          </h2>
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-zinc-100 h-7">
              View Detailed Profile →
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar className="h-14 w-14 border border-zinc-700">
            <AvatarFallback className="bg-zinc-800 text-zinc-100 font-bold text-lg">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-100">{user?.name || 'Developer'}</h3>
            <p className="text-xs text-zinc-400 font-mono">{user?.email || 'user@trackflow.local'}</p>
            <span className="inline-block text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded font-mono font-medium">
              Authenticated Session
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
          Workspace Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-lg space-y-1">
            <span className="text-zinc-400 font-medium">Joined Projects</span>
            <p className="text-xl font-bold text-zinc-100 font-mono">{projects.length}</p>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-lg space-y-1">
            <span className="text-zinc-400 font-medium">Environment</span>
            <p className="text-sm font-mono text-emerald-400 font-semibold">
              {import.meta.env.MODE === 'production' ? 'Production Mode' : 'Development Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* Developer API Configuration */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
          API & Connection Details
        </h2>

        <div className="space-y-2 text-xs">
          <label className="text-zinc-400 block font-medium">REST API Endpoint</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-md font-mono text-xs text-zinc-200 select-all"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyApiUrl}
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white shrink-0 text-xs"
            >
              Copy
            </Button>
          </div>
        </div>
      </div>

      {/* Session Actions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3 shadow-xs">
        <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider border-b border-zinc-800 pb-2">
          Session Management
        </h2>
        <p className="text-xs text-zinc-400">
          Terminate active session token on this device.
        </p>
        <Button
          onClick={logout}
          variant="outline"
          className="border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 hover:text-white text-xs"
        >
          Sign Out of TrackFlow
        </Button>
      </div>
    </div>
  );
}
