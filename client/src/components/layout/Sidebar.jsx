import { NavLink } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Projects', path: '/projects', icon: '📁' },
  { label: 'All Issues', path: '/issues', icon: '🎯' },
  { label: 'Profile', path: '/profile', icon: '👤' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

export default function Sidebar({ onClose }) {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-200 flex flex-col h-full md:h-screen border-r border-zinc-800 shrink-0 shadow-xl md:shadow-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800 font-semibold text-lg text-white">
        <div className="flex items-center gap-2">
          <span className="bg-zinc-800 text-zinc-100 text-xs px-2 py-1 rounded font-mono font-bold tracking-wider border border-zinc-700">
            TF
          </span>
          <span className="font-bold tracking-tight text-zinc-100">TrackFlow</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden text-zinc-400 hover:text-white h-7 w-7 p-0"
          >
            ✕
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-zinc-800/90 text-white font-semibold border border-zinc-700/60 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`
            }
          >
            <span className="text-sm">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Separator className="bg-zinc-800" />

      {/* Clean Bottom Logout action */}
      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-xs text-zinc-400 hover:text-rose-400 hover:bg-zinc-900/80 h-9 px-3 gap-2"
        >
          <span>🚪</span>
          <span>Log out</span>
        </Button>
      </div>
    </aside>
  );
}
