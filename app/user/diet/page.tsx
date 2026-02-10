import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Utensils, Calendar, Clock, Flame, Apple, Beef, Croissant, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const GRADIENTS = [
  'from-purple-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-orange-400 to-pink-600',
  'from-blue-400 to-cyan-500', 
  'from-emerald-400 to-teal-600'
];

const DIET_IMAGES = [
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80", // Healthy food
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80", // Food display
  "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800&q=80", // Meal prep
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80", // Salad
  "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80", // Breakfast
];

export default async function UserDietPage() {
  const user = await getCurrentUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <Utensils className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Diet Plan</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to load your diet plans. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Fetch all assigned diet plans
  const { data: dietPlans } = await supabaseAdmin
    .from('user_diet_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('is_active', { ascending: false });

  // Get active plan and fetch its details separately
  const activePlanAssignment = dietPlans?.find(p => p.is_active);
  let activeDietPlan: any = null;
  let meals: any[] = [];
  let suggestedPlans: any[] = [];

  if (activePlanAssignment?.diet_plan_id) {
    // Fetch the diet plan details
    const { data: planData } = await supabaseAdmin
      .from('diet_plans')
      .select('*')
      .eq('id', activePlanAssignment.diet_plan_id)
      .single();
    
    activeDietPlan = planData;

    // Fetch meals for this plan
    if (planData) {
      const { data: mealData } = await supabaseAdmin
        .from('diet_plan_meals')
        .select('*')
        .eq('diet_plan_id', planData.id)
        .order('meal_order', { ascending: true });
      
      meals = mealData || [];
    }
  } else {
    // Fetch suggested plans
    const { data } = await supabaseAdmin
        .from('diet_plans')
        .select('*')
        .eq('gym_id', user.gym_id)
        .limit(3);
    suggestedPlans = data || [];
  }

  // Fetch previous plan details
  const previousPlans = dietPlans?.filter(p => !p.is_active) || [];
  const previousPlanDetails: any[] = [];
  
  for (const plan of previousPlans.slice(0, 5)) {
    if (plan.diet_plan_id) {
      const { data: planData } = await supabaseAdmin
        .from('diet_plans')
        .select('id, name')
        .eq('id', plan.diet_plan_id)
        .single();
      
      if (planData) {
        previousPlanDetails.push({
          ...plan,
          diet_plan: planData
        });
      }
    }
  }

  // Group meals by day
  const mealsByDay = meals.reduce((acc: any, meal: any) => {
    const day = meal.day_of_week || 'Daily';
    if (!acc[day]) acc[day] = [];
    acc[day].push(meal);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-bottom duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              My Diet Plan
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View your personalized nutrition plan and meal schedules
            </p>
          </div>
          <Link 
            href="/user/diet/library" 
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <Utensils className="w-4 h-4" />
            Browse All Plans
          </Link>
        </div>
      </div>

      {/* Active Diet Plan */}
      {activeDietPlan ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
          <div className="h-1.5 bg-gradient-to-r from-green-500 to-teal-500" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div>
                <span className="inline-block px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-medium mb-2">
                  ✓ Active Plan
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {activeDietPlan.name}
                </h2>
                {activeDietPlan.description && (
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    {activeDietPlan.description}
                  </p>
                )}
              </div>
            </div>

            {/* Nutritional Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 sm:p-4 bg-orange-500/10 rounded-lg text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  {activeDietPlan.total_calories || '-'}
                </p>
                <p className="text-xs text-muted-foreground">Cal/day</p>
              </div>
              <div className="p-3 sm:p-4 bg-red-500/10 rounded-lg text-center">
                <Beef className="w-5 h-5 text-red-500 mx-auto mb-1.5" />
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  {activeDietPlan.protein_grams || '-'}g
                </p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="p-3 sm:p-4 bg-yellow-500/10 rounded-lg text-center">
                <Croissant className="w-5 h-5 text-yellow-600 mx-auto mb-1.5" />
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  {activeDietPlan.carbs_grams || '-'}g
                </p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="p-3 sm:p-4 bg-green-500/10 rounded-lg text-center">
                <Apple className="w-5 h-5 text-green-500 mx-auto mb-1.5" />
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  {activeDietPlan.fat_grams || '-'}g
                </p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>

            {/* Diet Preference */}
            {activeDietPlan.diet_preference && (
              <div className="mb-5 p-2.5 bg-muted/50 rounded-lg inline-flex items-center gap-2">
                <Utensils className="w-4 h-4 text-green-500" />
                <span className="text-sm capitalize">
                  {activeDietPlan.diet_preference.replace('_', ' ')} Diet
                </span>
              </div>
            )}

            {/* Meal Plan */}
            {Object.keys(mealsByDay).length > 0 ? (
              <div className="space-y-5">
                <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                  Meal Schedule
                </h3>
                {Object.entries(mealsByDay).map(([day, dayMeals]: [string, any]) => (
                  <div key={day} className="space-y-3">
                    <h4 className="font-medium text-foreground capitalize text-sm">{day}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dayMeals.map((meal: any) => (
                        <div
                          key={meal.id}
                          className="p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-border hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-foreground capitalize text-sm">
                              {meal.meal_type}
                            </h5>
                            {meal.calories && (
                              <span className="text-xs text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">
                                {meal.calories} cal
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground">{meal.meal_name}</p>
                          {meal.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {meal.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Utensils className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No specific meals added to this plan yet.</p>
                <p className="text-xs mt-1">Follow the nutritional guidelines above.</p>
              </div>
            )}

            {/* Plan Dates */}
            <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Started: {new Date(activePlanAssignment!.assigned_at).toLocaleDateString()}
              </div>
              {activePlanAssignment!.end_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Ends: {new Date(activePlanAssignment!.end_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
          <div className="space-y-2">
            <Utensils className="w-14 h-14 text-muted-foreground/30 mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">
              No Active Diet Plan
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              You don't have an active diet plan assigned. Check out these popular plans or contact your trainer.
            </p>
          </div>

          {suggestedPlans.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              {suggestedPlans.map((plan: any, i: number) => (
                <Link 
                  key={plan.id}
                  href={`/user/diet/library/${plan.id}`}
                  className="group relative overflow-hidden rounded-2xl h-48 flex flex-col justify-end p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={DIET_IMAGES[i % DIET_IMAGES.length]} 
                      alt="Diet Plan" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  </div>
                  
                  <div className="relative z-10 text-white">
                    <div className="mb-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-green-400 bg-green-500/20 px-2.5 py-1 rounded backdrop-blur-md border border-green-500/20">
                        {plan.diet_preference?.replace('_', ' ') || 'General'}
                      </span>
                    </div>
                    <h4 className="font-black text-2xl italic tracking-tight uppercase leading-none mb-2 drop-shadow-md">
                      {plan.name}
                    </h4>
                    <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-1">
                       <span className="text-xs text-gray-300 font-medium tracking-wide uppercase flex items-center gap-1.5">
                         <Flame className="w-3.5 h-3.5 text-orange-400" />
                         {plan.total_calories || 0} kcal
                       </span>
                       <div className="bg-white/10 p-1.5 rounded-full backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                         <ArrowRight className="w-4 h-4 text-white" />
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Previous Plans */}
      {previousPlanDetails.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both" style={{ animationDelay: '200ms' }}>
          <h3 className="text-base font-semibold text-foreground mb-4">
            Previous Plans
          </h3>
          <div className="space-y-2">
            {previousPlanDetails.map((plan: any) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Utensils className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {plan.diet_plan?.name || 'Unknown Plan'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(plan.assigned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs flex-shrink-0">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
