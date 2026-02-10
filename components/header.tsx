'use client';

import { User } from '@/lib/supabase';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-14 sm:h-16 bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Welcome Message - Hidden on very small screens, shown on sm+ */}
        <div className="hidden sm:block animate-in">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">
            Welcome back, <span className="text-primary">{user.first_name || 'User'}</span>!
          </h2>
          <p className="text-xs text-muted-foreground capitalize">
            {user.role} Dashboard
          </p>
        </div>
        
        {/* Mobile - Just show role */}
        <div className="sm:hidden animate-in">
          <p className="text-sm font-medium text-foreground capitalize">
            {user.role} Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
          <ThemeToggle />
        </div>
        <div className="transition-transform duration-200 hover:scale-105">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
