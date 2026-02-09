import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { Calendar, Plus, Search, Utensils, Users } from 'lucide-react';
import Link from 'next/link';
import { PlanActionsMenu } from '@/components/plan-actions-menu';
import { URLSearchInput } from '@/components/url-search-input';

export const dynamic = 'force-dynamic';

const DIET_IMAGES = [
  "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
  "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80",
];

export default async function DietPlansPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  // ... existing code ...
  const { q } = await searchParams;
  const user = await getCurrentUserData();
  if (!user?.gym_id) return null;

  let query = supabaseAdmin
    .from('diet_plans')
    .select('*, users(first_name, last_name)')
    .eq('gym_id', user.gym_id);

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data: plans } = await query.order('created_at', { ascending: false });

  const vegPlans = plans?.filter(p => p.diet_preference === 'veg') || [];
  const nonVegPlans = plans?.filter(p => p.diet_preference !== 'veg') || [];

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* ... header and search ... */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Diet Plans</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage nutrition programs</p>
        </div>
        <Link
          href="/admin/diets/new"
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 touch-manipulation"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Create Diet</span>
        </Link>
      </div>

      <div className="mb-6 max-w-md">
        <URLSearchInput placeholder="Search diet plans..." />
      </div>

      {!plans || plans.length === 0 ? (
        <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
          <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>{q ? `No diet plans found for "${q}"` : 'No diet plans found.'}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {vegPlans.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                Vegetarian Plans
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vegPlans.map((plan, i) => <DietPlanCard key={plan.id} plan={plan} index={i} />)}
              </div>
            </section>
          )}

          {nonVegPlans.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                Non-Vegetarian & Other Plans
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nonVegPlans.map((plan, i) => <DietPlanCard key={plan.id} plan={plan} index={i + vegPlans.length} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function DietPlanCard({ plan, index }: { plan: any; index: number }) {
  return (
    <div 
      className="group relative h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 block bg-zinc-900"
    >
      {/* Clickable Overlay */}
      <Link href={`/admin/diets/${plan.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View Details</span>
      </Link>

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={DIET_IMAGES[index % DIET_IMAGES.length]} 
          alt={plan.name}
          className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110 opacity-60 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 group-hover:opacity-80" />
      </div>

      {/* Top Actions & Badges */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
         <div className="bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg p-1 transition-colors border border-white/10">
            <PlanActionsMenu 
              planId={plan.id} 
              planType="diet" 
              planName={plan.name}
            />
         </div>
      </div>
      
      <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none">
         {plan.diet_preference && (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
              plan.diet_preference === 'veg' 
                ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                : plan.diet_preference === 'non_veg'
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
            }`}>
              {plan.diet_preference === 'veg' ? <Utensils className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
              {plan.diet_preference.replace('_', ' ')}
            </span>
         )}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 pointer-events-none">
        <div className="mb-1">
          <span className="text-xs font-bold text-primary tracking-wide uppercase">
             {plan.total_calories} Calories
          </span>
        </div>
        <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-2 drop-shadow-lg group-hover:text-primary transition-colors">
           {plan.name}
        </h3>
        
        <p className="text-sm text-gray-300 line-clamp-2 mb-4 font-medium opacity-90">
           {plan.description || 'Nutritious meal plan designed for your goals.'}
        </p>

        <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
          <div className="flex gap-4 text-xs font-bold text-gray-300 uppercase tracking-wide">
             <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                By {plan.users?.first_name || 'Admin'}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

