'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Dumbbell,
  Building2,
  Settings,
  BarChart3,
  Calendar,
  ClipboardList,
  TrendingUp,
  User,
  LucideIcon,
  Menu,
  X,
  Utensils
} from 'lucide-react';

// Icon mapping for string-based icon names
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  User,
  UserCog,
  Dumbbell,
  Building2,
  Settings,
  BarChart3,
  Calendar,
  ClipboardList,
  TrendingUp,
  Utensils,
};

export interface SidebarItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sidebar({ items, logo, footer }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Toggle Button - Only visible when sidebar is closed */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "md:hidden fixed top-3 left-4 z-50 p-2.5 rounded-xl transition-all duration-300 touch-manipulation",
          "bg-card/90 backdrop-blur-md border border-border shadow-lg hover:bg-muted active:scale-95",
          isOpen ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"
        )}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay for Mobile */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-40 h-screen w-[280px] md:w-64 bg-card border-r border-border flex flex-col",
        "transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-border min-h-[60px]">
          <div className="flex-1 min-w-0">
            {logo}
          </div>
          {/* Close button - Only on mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2.5 hover:bg-muted rounded-xl transition-all duration-200 active:scale-95 touch-manipulation ml-2"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = iconMap[item.icon] || Users;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 touch-manipulation',
                  'active:scale-[0.98]',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                <span className="font-medium text-sm">{item.title}</span>
                {item.badge && (
                  <span className={cn(
                    'ml-auto px-2 py-0.5 text-xs font-semibold rounded-full transition-colors',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="p-3 border-t border-border">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}

