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
  LucideIcon,
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

  return (
    // Sidebar - Hidden on mobile, visible on md+ screens
    <aside className="hidden md:flex sticky top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border flex-col">
      {/* Logo Header */}
      <div className="flex items-center p-5 border-b border-border min-h-[60px]">
        <div className="flex-1 min-w-0">
          {logo}
        </div>
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
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
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
  );
}

