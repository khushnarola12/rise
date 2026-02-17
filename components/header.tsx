'use client';

import { User } from '@/lib/supabase';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import { Building2 } from 'lucide-react';

interface HeaderProps {
  user: User;
  gymName?: string | null;
}

export function Header({ user, gymName }: HeaderProps) {
  return (
    <header className="h-14 sm:h-16 bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Welcome Message - Hidden on very small screens, shown on sm+ */}
        <div className="hidden sm:block animate-in">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">
            Welcome back, <span className="text-primary">{user.first_name || 'User'}</span>!
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground capitalize">
              {user.role} Dashboard
            </p>
            {gymName && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="text-border">•</span>
                <Building2 className="w-3 h-3" />
                {gymName}
              </span>
            )}
          </div>
        </div>
        
        {/* Mobile - Just show role and gym */}
        <div className="sm:hidden animate-in">
          <p className="text-sm font-medium text-foreground capitalize">
            {user.role} Dashboard
          </p>
          {gymName && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Building2 className="w-2.5 h-2.5" />
              {gymName}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
          <ThemeToggle />
        </div>
        
        {/* Notifications */}
        <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
          <NotificationsDropdown />
        </div>

        <div className="transition-transform duration-200 hover:scale-105">
          <UserMenu user={user} gymName={gymName} />
        </div>
      </div>
    </header>
  );
}
