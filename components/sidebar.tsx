'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
  LucideIcon 
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
};

export interface SidebarItem {
  title: string;
  href: string;
  icon: string; // Changed to string for Server Component compatibility
  badge?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

// ... imports
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

// ... (keep iconMap and interfaces as they are up to line 49)

export function Sidebar({ items, logo, footer }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-3 left-4 z-50 p-2 text-foreground rounded-lg hover:bg-white/10 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-40 h-screen w-64 glass border-r border-border flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          {logo}
          {/* Close button inside sidebar for mobile ease */}
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 hover:bg-muted rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = iconMap[item.icon] || Users;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                )} />
                <span className="font-medium">{item.title}</span>
                {item.badge && (
                  <span className={cn(
                    'ml-auto px-2 py-0.5 text-xs font-semibold rounded-full',
                    isActive
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-primary text-primary-foreground'
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
          <div className="p-4 border-t border-border">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}
