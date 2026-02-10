import { getCurrentUserData } from '@/lib/auth';
import { getDietPlan } from '@/app/actions/diets';
import { notFound } from 'next/navigation';
import { ArrowLeft, Target, Utensils, Flame, ChefHat, Apple, Coffee, Moon, Cookie } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

const MEAL_TYPE_CONFIG = {
  breakfast: { icon: Coffee, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'Breakfast' },
  lunch: { icon: Utensils, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Lunch' },
  dinner: { icon: Moon, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'Dinner' },
  snacks: { icon: Cookie, color: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Snack' },
  snack: { icon: Cookie, color: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Snack' },
} as const;

const PREF_CONFIG = {
  veg: { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: Apple },
  non_veg: { badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', icon: Utensils },
  custom: { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Utensils },
} as const;

export default async function AdminDietDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserData();

  if (!user || !['superuser', 'admin'].includes(user.role)) {
    return notFound();
  }

  const plan = await getDietPlan(id);

  if (!plan) {
    notFound();
  }

  if (plan.gym_id !== user.gym_id) {
    return notFound();
  }

  const meals = plan.diet_plan_meals?.sort((a: any, b: any) => a.meal_order - b.meal_order) || [];

  const pref = (plan.diet_preference as keyof typeof PREF_CONFIG) || 'custom';
  const prefConfig = PREF_CONFIG[pref] || PREF_CONFIG.custom;
  const PrefIcon = prefConfig.icon;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-bottom duration-500">
        <Link
          href="/admin/diets"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group/back"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover/back:-translate-x-1" />
          Back to Diets
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
          <div className="flex flex-wrap gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${prefConfig.badge}`}>
              <PrefIcon className="w-4 h-4" />
              <span className="capitalize font-medium">{plan.diet_preference?.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-lg text-sm">
              <Flame className="w-4 h-4" />
              <span className="font-medium">{plan.total_calories} kcal</span>
            </div>
            <Link
              href={`/admin/diets/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all text-sm font-medium shadow-lg shadow-primary/20"
            >
              Edit Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div 
        className="bg-card border border-border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both"
        style={{ animationDelay: '100ms' }}
      >
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-green-500/10 to-transparent border-b border-border">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            Meals
            <span className="text-xs font-normal text-muted-foreground ml-1">({meals.length} meals)</span>
          </h2>
        </div>
        
        {meals.length > 0 ? (
          <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
            {meals.map((meal: any, index: number) => {
              const mealType = (meal.meal_type as keyof typeof MEAL_TYPE_CONFIG) || 'snacks';
              const mealConfig = MEAL_TYPE_CONFIG[mealType] || MEAL_TYPE_CONFIG.snacks;
              const MealIcon = mealConfig.icon;
              
              return (
                <div 
                  key={meal.id} 
                  className="p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-border transition-all duration-300 hover:shadow-md group/meal animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both"
                  style={{ animationDelay: `${(index + 2) * 80}ms` }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors duration-300 group-hover/meal:scale-105 ${mealConfig.color}`}>
                      <MealIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-foreground text-sm sm:text-base">{meal.meal_name}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full capitalize font-bold border ${mealConfig.color}`}>
                            {meal.meal_type}
                          </span>
                          {meal.calories && (
                            <span className="text-[10px] sm:text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                              {meal.calories} kcal
                            </span>
                          )}
                        </div>
                      </div>
                      {meal.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">{meal.description}</p>
                      )}
                      
                      {(meal.protein_g || meal.carbs_g || meal.fats_g) && (
                        <div className="flex gap-3 text-xs pt-2 border-t border-border/50">
                          {meal.protein_g != null && (
                            <span className="inline-flex items-center gap-1 font-medium text-rose-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              P: {meal.protein_g}g
                            </span>
                          )}
                          {meal.carbs_g != null && (
                            <span className="inline-flex items-center gap-1 font-medium text-blue-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              C: {meal.carbs_g}g
                            </span>
                          )}
                          {meal.fats_g != null && (
                            <span className="inline-flex items-center gap-1 font-medium text-amber-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              F: {meal.fats_g}g
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Utensils className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-lg font-medium text-muted-foreground">No meals in this plan</p>
            <p className="text-sm text-muted-foreground mt-1">Edit the plan to add meals</p>
          </div>
        )}
      </div>
    </div>
  );
}
