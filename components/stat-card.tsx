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
  delay?: number;
}

export const StatCard = memo(function StatCard({ title, value, icon: Icon, trend, className, delay = 0 }: StatCardProps) {
  return (
    <div 
      className={cn(
        'bg-card border border-border rounded-xl p-4 sm:p-5',
        'transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
        'hover:-translate-y-1 hover:border-primary/20',
        'group cursor-default',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">{value}</h3>
          
          {trend && (
            <p className={cn(
              'text-xs font-medium mt-1.5 flex items-center gap-1',
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              <span className={cn(
                'inline-flex transition-transform duration-300',
                trend.isPositive && 'group-hover:-translate-y-0.5',
                !trend.isPositive && 'group-hover:translate-y-0.5'
              )}>
                {trend.isPositive ? '↑' : '↓'}
              </span> 
              {Math.abs(trend.value)}%
            </p>
          )}
        </div>

        <div className={cn(
          "w-10 h-10 sm:w-11 sm:h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0",
          "transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110"
        )}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
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
  delay?: number;
}

export const GradientStatCard = memo(function GradientStatCard({ title, value, icon: Icon, gradient, delay = 0 }: GradientStatCardProps) {
  return (
    <div 
      className={cn(
        'rounded-xl p-4 sm:p-5 relative overflow-hidden',
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        'group cursor-default',
        gradient
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0",
            "transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110"
          )}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>
        
        <p className="text-xs sm:text-sm font-medium text-white/80 mb-0.5">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold text-white tabular-nums">{value}</h3>
      </div>
    </div>
  );
});
