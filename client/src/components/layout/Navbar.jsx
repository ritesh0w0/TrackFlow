import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

export default function Navbar({ onToggleMobileNav }) {
  const { user } = useAuth();

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
            ☰
          </Button>
        )}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="System Status: Connected" />
          <h1 className="text-xs sm:text-sm font-semibold text-zinc-200">TrackFlow Workspace</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Static, unclickable profile logo */}
        <div className="flex items-center gap-2.5 select-none pointer-events-none">
          <Avatar className="h-8 w-8 border border-zinc-700">
            <AvatarFallback className="bg-zinc-800 text-zinc-200 text-xs font-semibold">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
