'use client';

import dynamic from 'next/dynamic';
import { Menu } from 'lucide-react';
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
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="h-14 sm:h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex flex-col min-w-0 flex-1">
          {/* Mobile Brand Name */}
          <span className="md:hidden text-base font-bold text-foreground truncate pl-10 sm:pl-12">
            Rise Fitness
          </span>
          
          {/* Desktop Welcome Message */}
          <div className="hidden md:block">
            <h2 className="text-base font-semibold text-foreground">
              Welcome back, {user.first_name || 'User'}!
            </h2>
            <p className="text-xs text-muted-foreground capitalize">
              {user.role} Dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 sm:w-9 sm:h-9"
            }
          }}
        />
      </div>
    </header>
  );
}

