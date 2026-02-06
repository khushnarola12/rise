import { getCurrentUserData } from '@/lib/auth';
import { getDietPlan } from '@/app/actions/diets';
import { notFound } from 'next/navigation';
import { ArrowLeft, Utensils, Flame, Beef, Droplet, Apple, Clock, ChefHat } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDietLibraryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserData();

  if (!user) {
    return notFound();
  }

  const plan = await getDietPlan(id);

  if (!plan) {
    notFound();
  }

  // Verify access (same gym)
  if (plan.gym_id !== user.gym_id) {
    return notFound();
  }

  const meals = plan.diet_plan_meals?.sort((a: any, b: any) => a.meal_order - b.meal_order) || [];

  // Group meals by day
  const mealsByDay = meals.reduce((acc: any, meal: any) => {
    const day = meal.day_of_week || 'Daily';
    if (!acc[day]) acc[day] = [];
    acc[day].push(meal);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom">
      {/* Header */}
      <div>
        <Link
          href="/user/diet/library"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {plan.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {plan.description}
            </p>
          </div>
          {plan.diet_preference && (
            <div className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize flex items-center gap-2 ${
              plan.diet_preference === 'veg' 
                ? 'bg-green-500/10 text-green-600' 
                : plan.diet_preference === 'non_veg'
                  ? 'bg-red-500/10 text-red-600'
                  : 'bg-orange-500/10 text-orange-600'
            }`}>
              {plan.diet_preference === 'veg' ? <Apple className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
              {plan.diet_preference.replace('_', ' ')}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Meal Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Meal Schedule</h2>
            
            {Object.keys(mealsByDay).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(mealsByDay).map(([day, dayMeals]: [string, any]) => (
                  <div key={day} className="space-y-3">
                    <h3 className="font-medium text-foreground capitalize flex items-center gap-2">
                       <Clock className="w-4 h-4 text-muted-foreground" />
                      {day}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {dayMeals.map((meal: any) => (
                        <div
                          key={meal.id}
                          className="p-4 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {meal.meal_type === 'breakfast' && <ChefHat className="w-4 h-4 text-orange-400" />}
                              {meal.meal_type === 'lunch' && <Utensils className="w-4 h-4 text-blue-400" />}
                              {meal.meal_type === 'dinner' && <Utensils className="w-4 h-4 text-purple-400" />}
                              {meal.meal_type === 'snack' && <Apple className="w-4 h-4 text-green-400" />}
                              <h4 className="font-semibold text-foreground capitalize">
                                {meal.meal_type}
                              </h4>
                            </div>
                            {meal.calories && (
                              <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border border-border">
                                {meal.calories} kcal
                              </span>
                            )}
                          </div>
                          
                          <p className="text-foreground font-medium mb-1">{meal.meal_name}</p>
                          
                          {meal.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {meal.description}
                            </p>
                          )}

                          {/* Meal Macros */}
                          {(meal.protein_grams || meal.carbs_grams || meal.fat_grams) && (
                            <div className="flex gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
                              {meal.protein_grams && <span>P: {meal.protein_grams}g</span>}
                              {meal.carbs_grams && <span>C: {meal.carbs_grams}g</span>}
                              {meal.fat_grams && <span>F: {meal.fat_grams}g</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No meals scheduled yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Stats */}
        <div className="space-y-6">
          {/* Target Macros */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Target Daily Macros</h2>
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/10 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-full">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-xl font-bold text-foreground">{plan.total_calories}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-red-500/10 rounded-lg text-center">
                  <Beef className="w-4 h-4 text-red-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{plan.protein_grams}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                  <Droplet className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{plan.carbs_grams}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                  <div className="w-4 h-4 rounded-full border-2 border-yellow-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{plan.fat_grams}g</p>
                  <p className="text-xs text-muted-foreground">Fats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
