import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/useAuth';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar({ onToggleMobileNav }) {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'TF';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-14 bg-zinc-950 border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {onToggleMobileNav && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMobileNav}
            className="md:hidden text-zinc-400 hover:text-white p-1.5 h-8 w-8"
            title="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Status: Connected" />
          <h1 className="text-xs sm:text-sm font-semibold text-zinc-200">TrackFlow Workspace</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* UI-07: Interactive Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none p-1 rounded-md hover:bg-zinc-900 transition-colors cursor-pointer group">
            <Avatar className="h-8 w-8 border border-zinc-700">
              <AvatarFallback className="bg-zinc-800 text-zinc-200 text-xs font-semibold">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline-block text-xs font-medium text-zinc-300 group-hover:text-white max-w-[120px] truncate">
              {user?.name || 'Account'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 bg-zinc-900 border border-zinc-800 text-zinc-200 p-1.5 shadow-xl">
            <div className="px-2.5 py-2 border-b border-zinc-800 mb-1">
              <span className="text-[11px] text-zinc-400 block font-normal">Signed in as</span>
              <strong className="text-xs font-semibold text-zinc-100 block truncate">{user?.email || 'User'}</strong>
            </div>
            <DropdownMenuItem className="p-0">
              <Link to="/profile" className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0">
              <Link to="/settings" className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded">
                <Settings className="w-3.5 h-3.5 text-zinc-400" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={logout}
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
