'use client';

import dynamic from 'next/dynamic';
import { User } from '@/lib/supabase';
import { ThemeToggle } from '@/components/theme-toggle';

// Dynamic import UserButton to prevent hydration mismatch
const UserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton),
  { 
    ssr: false,
    loading: () => (
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted animate-pulse" />
    )
  }
);

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
        <div className="sm:hidden animate-in pl-12">
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
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 sm:w-9 sm:h-9 ring-2 ring-border hover:ring-primary transition-all duration-200"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}

