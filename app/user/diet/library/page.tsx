import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Utensils, Apple, Users, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { URLSearchInput } from '@/components/url-search-input';

export const dynamic = 'force-dynamic';

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
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Header */}
      <div>
        <Link
          href="/user/diet"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
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
      <div className="mb-6 max-w-md">
        <URLSearchInput placeholder="Search diet plans..." />
      </div>

      {/* Diet Plans Grid */}
      {filteredPlans && filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const usage = usageMap[plan.id] || { total: 0, active: 0 };
            
            return (
              <div
                key={plan.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                  {/* Card Header Strip */}
                  <div className={`h-2 bg-gradient-to-r ${
                    plan.diet_preference === 'veg' 
                      ? 'from-green-500 to-emerald-500' 
                      : plan.diet_preference === 'non_veg'
                        ? 'from-red-500 to-rose-500'
                        : 'from-orange-500 to-amber-500' // Custom/Other
                  }`} />
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-xl font-bold transition-colors ${
                        plan.diet_preference === 'veg' 
                          ? 'group-hover:text-green-500' 
                          : plan.diet_preference === 'non_veg'
                            ? 'group-hover:text-red-500'
                            : 'group-hover:text-orange-500'
                      }`}>
                        {plan.name}
                      </h3>
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium border border-border">
                        {plan.total_calories} kcal
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plan.description || 'No description provided.'}
                    </p>

                    {/* Macros */}
                    <div className="flex gap-3">
                      {plan.protein_grams && (
                        <div className="text-center">
                          <p className="text-lg font-semibold text-primary">{plan.protein_grams}g</p>
                          <p className="text-xs text-muted-foreground">Protein</p>
                        </div>
                      )}
                      {plan.carbs_grams && (
                        <div className="text-center">
                          <p className="text-lg font-semibold text-primary">{plan.carbs_grams}g</p>
                          <p className="text-xs text-muted-foreground">Carbs</p>
                        </div>
                      )}
                      {plan.fat_grams && (
                        <div className="text-center">
                          <p className="text-lg font-semibold text-primary">{plan.fat_grams}g</p>
                          <p className="text-xs text-muted-foreground">Fat</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {plan.diet_preference && (
                        <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs capitalize ${
                          plan.diet_preference === 'veg' 
                            ? 'bg-green-500/10 text-green-500' 
                            : plan.diet_preference === 'non_veg'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-orange-500/10 text-orange-500'
                        }`}>
                          {plan.diet_preference === 'veg' ? <Apple className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
                          {plan.diet_preference.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{usage.active}</span>
                        <span className="text-muted-foreground">active</span>
                      </div>
                    </div>
                    <Link
                      href={`/user/diet/library/${plan.id}`}
                      className="text-sm text-green-500 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
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
