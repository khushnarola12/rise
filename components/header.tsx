'use client';

import { UserButton } from '@clerk/nextjs';
import { Bell, Menu } from 'lucide-react';
import { User } from '@/lib/supabase';
import { ThemeToggle } from '@/components/theme-toggle';

interface HeaderProps {
  user: User;
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="h-14 sm:h-16 glass border-b border-border px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors touch-manipulation"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex flex-col min-w-0 flex-1">
          {/* Mobile Brand Name */}
          <span className="md:hidden text-base sm:text-lg font-bold text-foreground truncate pl-10 sm:pl-12">
            Rise Fitness
          </span>
          
          {/* Desktop Welcome Message */}
          <div className="hidden md:block">
            <h2 className="text-base lg:text-lg font-semibold text-foreground truncate">
              Welcome back, {user.first_name || 'User'}!
            </h2>
            <p className="text-xs lg:text-sm text-muted-foreground capitalize">
              {user.role} Dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <ThemeToggle />
        
        {/* User Button */}
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
            }
          }}
        />
      </div>
    </header>
  );
}
