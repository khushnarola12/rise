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
  Utensils,
  MoreHorizontal
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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

export interface BottomNavItem {
  title: string;
  href: string;
  icon: string;
}

interface BottomNavProps {
  items: BottomNavItem[];
  maxVisible?: number;
}

export function BottomNav({ items, maxVisible = 4 }: BottomNavProps) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Split items into visible and overflow
  const visibleItems = items.slice(0, maxVisible);
  const overflowItems = items.slice(maxVisible);
  const hasOverflow = overflowItems.length > 0;

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  // Check if any overflow item is active
  const isOverflowActive = overflowItems.some(
    item => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = iconMap[item.icon] || LayoutDashboard;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full px-1 py-2 transition-all duration-200 touch-manipulation',
                'active:scale-95',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'relative p-1.5 rounded-xl transition-all duration-200',
                isActive && 'bg-primary/10'
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-1 transition-all duration-200 truncate max-w-full",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.title}
              </span>
            </Link>
          );
        })}

        {/* More Button */}
        {hasOverflow && (
          <div ref={moreMenuRef} className="relative flex-1 h-full">
            <button
              onClick={() => setShowMore(!showMore)}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full px-1 py-2 transition-all duration-200 touch-manipulation',
                'active:scale-95',
                isOverflowActive || showMore
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'relative p-1.5 rounded-xl transition-all duration-200',
                (isOverflowActive || showMore) && 'bg-primary/10'
              )}>
                <MoreHorizontal className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  showMore && "rotate-90"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-1 transition-all duration-200",
                isOverflowActive || showMore ? "text-primary" : "text-muted-foreground"
              )}>
                More
              </span>
            </button>

            {/* Overflow Menu */}
            {showMore && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in slide-up">
                {overflowItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = iconMap[item.icon] || LayoutDashboard;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 transition-all duration-200 touch-manipulation',
                        'active:scale-[0.98]',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
