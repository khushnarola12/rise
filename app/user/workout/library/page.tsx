import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Dumbbell, Calendar, Users, Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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

export default async function UserWorkoutLibraryPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const user = await getCurrentUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Workouts</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to load workout plans. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Fetch ALL workout plans in the gym
  const { data: plans } = await supabaseAdmin
    .from('workout_plans')
    .select('*, users:created_by(first_name, last_name)')
    .eq('gym_id', user.gym_id)
    .order('created_at', { ascending: false });

  // Count how many members are using each plan
  const planIds = plans?.map(p => p.id) || [];
  const { data: planUsage } = planIds.length > 0 ? await supabaseAdmin
    .from('user_workout_plans')
    .select('workout_plan_id, is_active')
    .in('workout_plan_id', planIds) : { data: [] };

  const usageMap = planUsage?.reduce((acc: any, usage: any) => {
    if (!acc[usage.workout_plan_id]) {
      acc[usage.workout_plan_id] = { total: 0, active: 0 };
    }
    acc[usage.workout_plan_id].total++;
    if (usage.is_active) acc[usage.workout_plan_id].active++;
    return acc;
  }, {}) || {};

  // Filter plans based on search query
  const filteredPlans = plans?.filter((plan) => {
    if (!q) return true;
    const authorName = plan.users ? `${plan.users.first_name} ${plan.users.last_name}` : '';
    const searchString = `${plan.name} ${plan.description} ${authorName}`.toLowerCase();
    return searchString.includes(q.toLowerCase());
  }) || [];

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Header */}
      <div>
        <Link
          href="/user/workout"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Plan
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Workout Library
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Browse all available workout programs in the gym
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <URLSearchInput placeholder="Search workout plans..." />
      </div>

      {/* Workout Plans Grid */}
      {filteredPlans && filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan, i) => {
            const usage = usageMap[plan.id] || { total: 0, active: 0 };
            
            return (
              <Link
                key={plan.id}
                href={`/user/workout/library/${plan.id}`}
                className="group relative h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 block"
              >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={WORKOUT_IMAGES[i % WORKOUT_IMAGES.length]} 
                      alt={plan.name}
                      className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80" />
                  </div>
                  
                  {/* Floating Badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                     {plan.difficulty && (
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                          plan.difficulty === 'beginner' 
                            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                            : plan.difficulty === 'intermediate'
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                          {plan.difficulty}
                        </span>
                     )}
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-2 drop-shadow-lg group-hover:text-primary transition-colors">
                      {plan.name}
                    </h3>
                    
                    <p className="text-sm text-gray-300 line-clamp-2 mb-4 font-medium opacity-90">
                      {plan.description || 'Professional workout plan designed for results.'}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
                      <div className="flex gap-4 text-xs font-bold text-gray-300 uppercase tracking-wide">
                         {plan.duration_weeks && (
                           <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              {plan.duration_weeks} Weeks
                           </div>
                         )}
                         <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            {usage.active} Active
                         </div>
                      </div>
                      <div className="bg-white/10 p-2 rounded-full backdrop-blur-md group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </div>
                    </div>
                  </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Workout Plans Found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            There are no workout plans available matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
