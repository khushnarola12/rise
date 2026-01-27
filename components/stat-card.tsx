

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard = memo(function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6 card-hover',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums tracking-tight">{value}</h3>
          
          {trend && (
            <p className={cn(
              'text-xs sm:text-sm font-medium mt-2',
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>

        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
      </div>
    </div>
  );
});

interface GradientStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
}

export const GradientStatCard = memo(function GradientStatCard({ title, value, icon: Icon, gradient }: GradientStatCardProps) {
  return (
    <div className={cn(
      'rounded-xl p-4 sm:p-5 md:p-6 card-hover relative overflow-hidden',
      gradient
    )}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-current/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-current" />
          </div>
        </div>
        
        <p className="text-xs sm:text-sm font-medium text-current/80 mb-1">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-current">{value}</h3>
      </div>

      {/* Decorative circles */}
      <div className="absolute -right-4 -bottom-4 w-20 h-20 sm:w-24 sm:h-24 bg-current/10 rounded-full blur-2xl"></div>
      <div className="absolute -left-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-current/10 rounded-full blur-2xl"></div>
    </div>
  );
});
