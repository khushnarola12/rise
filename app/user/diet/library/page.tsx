import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Utensils, Apple, Users, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { URLSearchInput } from '@/components/url-search-input';

export const dynamic = 'force-dynamic';

const DIET_IMAGES = [
  "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80", // Healthy bowl
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80", // Salad
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80", // Keto/Avocado
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", // Dark food
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80", // Pancakes/Breakfast
  "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80", // Oatmeal
];

export default async function UserDietLibraryPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const user = await getCurrentUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <Utensils className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Diet Plans</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to load diet plans. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Fetch ALL diet plans in the gym
  const { data: plans } = await supabaseAdmin
    .from('diet_plans')
    .select('*, users:created_by(first_name, last_name)')
    .eq('gym_id', user.gym_id)
    .order('created_at', { ascending: false });

  // Count how many members are using each plan
  const planIds = plans?.map(p => p.id) || [];
  const { data: planUsage } = planIds.length > 0 ? await supabaseAdmin
    .from('user_diet_plans')
    .select('diet_plan_id, is_active')
    .in('diet_plan_id', planIds) : { data: [] };

  const usageMap = planUsage?.reduce((acc: any, usage: any) => {
    if (!acc[usage.diet_plan_id]) {
      acc[usage.diet_plan_id] = { total: 0, active: 0 };
    }
    acc[usage.diet_plan_id].total++;
    if (usage.is_active) acc[usage.diet_plan_id].active++;
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
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-bottom duration-500">
        <Link
          href="/user/diet"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group/back"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover/back:-translate-x-1" />
          Back to My Plan
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Diet Library
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Browse all available nutrition programs in the gym
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
        <URLSearchInput placeholder="Search diet plans..." />
      </div>

      {/* Diet Plans Grid */}
      {filteredPlans && filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan, i) => {
            const usage = usageMap[plan.id] || { total: 0, active: 0 };
            
            return (
              <Link
                key={plan.id}
                href={`/user/diet/library/${plan.id}`}
                className="group relative h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 block animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both"
                style={{ animationDelay: `${Math.min(i * 80, 400)}ms` }}
              >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={DIET_IMAGES[i % DIET_IMAGES.length]} 
                      alt={plan.name}
                      className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80" />
                  </div>
                  
                  {/* Floating Badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                     {plan.diet_preference && (
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                          plan.diet_preference === 'veg' 
                            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                            : plan.diet_preference === 'non_veg'
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        }`}>
                          {plan.diet_preference === 'veg' ? <Apple className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
                          {plan.diet_preference.replace('_', ' ')}
                        </span>
                     )}
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-6">
                    <div className="mb-1">
                      <span className="text-xs font-bold text-primary tracking-wide uppercase">
                         {plan.total_calories} Calories
                      </span>
                    </div>
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-2 drop-shadow-lg group-hover:text-primary transition-colors">
                      {plan.name}
                    </h3>
                    
                    {/* Macros Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded p-1.5 text-center">
                           <span className="block text-xs text-gray-400 uppercase font-bold">Protein</span>
                           <span className="block text-sm font-bold text-white">{plan.protein_grams}g</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded p-1.5 text-center">
                           <span className="block text-xs text-gray-400 uppercase font-bold">Carbs</span>
                           <span className="block text-sm font-bold text-white">{plan.carbs_grams}g</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded p-1.5 text-center">
                           <span className="block text-xs text-gray-400 uppercase font-bold">Fats</span>
                           <span className="block text-sm font-bold text-white">{plan.fat_grams}g</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
                      <div className="flex gap-4 text-xs font-bold text-gray-300 uppercase tracking-wide">
                         <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            {usage.active} Active Members
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
        <div className="bg-card border border-border rounded-2xl p-12 text-center animate-in fade-in duration-500">
          <Utensils className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Diet Plans Found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            There are no diet plans available matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
