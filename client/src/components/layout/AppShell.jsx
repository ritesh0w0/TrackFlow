import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function AppShell() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
        {/* Desktop Sidebar & Mobile Drawer */}
        <div
          className={`${
            isMobileNavOpen ? 'block' : 'hidden'
          } md:block fixed md:static inset-y-0 left-0 z-50`}
        >
          <Sidebar onClose={() => setIsMobileNavOpen(false)} />
        </div>

        {/* Mobile backdrop */}
        {isMobileNavOpen && (
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          />
        )}

        {/* Main View Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)} />
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
