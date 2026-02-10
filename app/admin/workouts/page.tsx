import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { Dumbbell, Plus, Calendar, Users, Target, Clock } from 'lucide-react';
import Link from 'next/link';
import { PlanActionsMenu } from '@/components/plan-actions-menu';
import { URLSearchInput } from '@/components/url-search-input';

export const dynamic = 'force-dynamic';

const WORKOUT_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80",
  "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  "https://images.unsplash.com/photo-1574680096141-1c57c502aa8f?w=800&q=80",
];

const DIFFICULTY_CONFIG = {
  beginner: { color: 'from-emerald-500 to-green-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30', glow: 'shadow-emerald-500/20' },
  intermediate: { color: 'from-amber-500 to-yellow-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30', glow: 'shadow-amber-500/20' },
  advanced: { color: 'from-rose-500 to-red-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-400/30', glow: 'shadow-rose-500/20' },
} as const;

export default async function WorkoutsPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const user = await getCurrentUserData();
  if (!user?.gym_id) return null;

  let query = supabaseAdmin
    .from('workout_plans')
    .select('*, users(first_name, last_name)')
    .eq('gym_id', user.gym_id);

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data: plans } = await query.order('created_at', { ascending: false });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom duration-500">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Workout Plans</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage training programs</p>
        </div>
        <Link
          href="/admin/workouts/new"
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Create Plan</span>
        </Link>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-100 fill-mode-both">
        <div className="mb-6 max-w-md">
          <URLSearchInput placeholder="Search workout plans..." />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {!plans || plans.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-card border border-border rounded-2xl animate-in fade-in duration-500">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 opacity-15" />
            <p className="text-lg font-medium">{q ? `No results for "${q}"` : 'No workout plans yet'}</p>
            <p className="text-sm mt-1">Create your first plan to get started!</p>
          </div>
        ) : (
          plans.map((plan, i) => {
            const difficulty = (plan.difficulty as keyof typeof DIFFICULTY_CONFIG) || 'beginner';
            const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.beginner;
            
            return (
              <div 
                key={plan.id}
                className="group relative h-[300px] sm:h-72 rounded-2xl overflow-hidden bg-zinc-900 animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both"
                style={{ animationDelay: `${Math.min(i * 80, 400)}ms` }}
              >
                {/* Clickable Overlay */}
                <Link href={`/admin/workouts/${plan.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">View Details</span>
                </Link>

                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={WORKOUT_IMAGES[i % WORKOUT_IMAGES.length]} 
                    alt={plan.name}
                    className="w-full h-full object-cover transition-all duration-700 ease-out opacity-50 group-hover:opacity-80 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 transition-opacity duration-500 group-hover:via-black/40" />
                </div>

                {/* Animated Accent Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.color} opacity-80 z-20 transition-all duration-500 group-hover:h-1.5 group-hover:opacity-100`} />

                {/* Top Right Actions */}
                <div className="absolute top-3 right-3 z-20">
                  <div className="bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-lg p-1 transition-all duration-200 border border-white/10 hover:border-white/20">
                    <PlanActionsMenu 
                      planId={plan.id} 
                      planType="workout" 
                      planName={plan.name}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end px-5 pb-5 pt-16 sm:px-6 sm:pb-6 pointer-events-none">
                  {/* Difficulty Badge */}
                  <div className="mb-2">
                    {plan.difficulty && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${config.badge} transition-all duration-300 group-hover:scale-105`}>
                        <Target className="w-2.5 h-2.5" />
                        {plan.difficulty}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-1.5 drop-shadow-lg transition-colors duration-300 group-hover:text-primary line-clamp-2">
                    {plan.name}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-gray-300/90 line-clamp-2 mb-3 font-medium">
                    {plan.description || 'Professional workout plan designed for results.'}
                  </p>

                  <div className="flex items-center gap-3 border-t border-white/15 pt-3 mt-auto">
                    <div className="flex gap-3 text-[10px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wide">
                      {plan.duration_weeks && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                          {plan.duration_weeks} Weeks
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                        By {plan.users?.first_name || 'Admin'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
