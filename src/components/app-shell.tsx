'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, Users, Upload, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// ============================================================
// CHANGE THIS TO 'topbar' TO SWITCH BACK TO TOP NAVIGATION
// ============================================================
const NAV_MODE: 'sidebar' | 'topbar' = 'sidebar';

const navItems = [
  { href: '/dashboard', label: 'Contacts', icon: Users },
  { href: '/import', label: 'Import', icon: Upload },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function SidebarNav({ userEmail, onSignOut }: { userEmail?: string; onSignOut: () => void }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold text-foreground">
          Dre&apos;s Contacts
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">MVP</Badge>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/20"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-out nav */}
      <div className={`md:hidden fixed top-14 left-0 bottom-0 z-30 w-64 bg-white border-r border-border transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground truncate">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{userEmail}</span>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60 bg-white border-r border-border z-20">
        {/* Logo */}
        <div className="flex items-center gap-2 h-14 px-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold text-foreground">
            Dre&apos;s Contacts
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">MVP</Badge>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground truncate">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{userEmail}</span>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

function TopbarNav({ userEmail, onSignOut }: { userEmail?: string; onSignOut: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold text-foreground">
              Dre&apos;s Contact Database
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">MVP</Badge>
            </Link>
            <nav className="hidden sm:flex gap-1">
              {navItems.filter(item => item.href !== '/settings').map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">{userEmail}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  children,
  userEmail,
  mode = NAV_MODE,
}: {
  children: React.ReactNode;
  userEmail?: string;
  mode?: 'sidebar' | 'topbar';
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (mode === 'topbar') {
    return (
      <div className="min-h-screen bg-background">
        <TopbarNav userEmail={userEmail} onSignOut={handleSignOut} />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav userEmail={userEmail} onSignOut={handleSignOut} />
      {/* Main content — offset for sidebar on desktop, for top bar on mobile */}
      <main className="md:ml-60 pt-14 md:pt-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
