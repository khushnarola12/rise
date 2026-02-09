import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { Dumbbell, Plus, Calendar, Users } from 'lucide-react';
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workout Plans</h1>
          <p className="text-muted-foreground">Manage training programs</p>
        </div>
        <Link
          href="/admin/workouts/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      <div className="mb-6 max-w-md">
        <URLSearchInput placeholder="Search workout plans..." />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!plans || plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No workout plans found. Create one to get started!</p>
          </div>
        ) : (
          plans.map((plan, i) => (
            <Link 
              key={plan.id}
              href={`/admin/workouts/${plan.id}`}
              className="group relative h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 block bg-zinc-900"
            >
               {/* Background Image */}
               <div className="absolute inset-0">
                 <img 
                   src={WORKOUT_IMAGES[i % WORKOUT_IMAGES.length]} 
                   alt={plan.name}
                   className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110 opacity-60 group-hover:opacity-100"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 group-hover:opacity-80" />
               </div>

               {/* Top Right Actions */}
               <div className="absolute top-4 right-4 z-20">
                 <div className="bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg p-1 transition-colors border border-white/10">
                    <PlanActionsMenu 
                      planId={plan.id} 
                      planType="workout" 
                      planName={plan.name}
                    />
                 </div>
               </div>

               {/* Content */}
               <div className="relative z-10 h-full flex flex-col justify-end p-6">
                 {/* Difficulty Badge */}
                 <div className="mb-2">
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

                 <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-2 drop-shadow-lg group-hover:text-primary transition-colors">
                   {plan.name}
                 </h3>
                 
                 <p className="text-sm text-gray-300 line-clamp-2 mb-4 font-medium opacity-90">
                   {plan.description || 'Professional workout plan designed for results.'}
                 </p>

                 <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
                   <div className="flex gap-4 text-xs font-bold text-gray-300 uppercase tracking-wide">
                      <div className="flex items-center gap-1.5">
                         <Calendar className="w-3.5 h-3.5 text-primary" />
                         {plan.duration_weeks} Weeks
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Users className="w-3.5 h-3.5 text-primary" />
                         By {plan.users?.first_name || 'Admin'}
                      </div>
                   </div>
                 </div>
               </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

