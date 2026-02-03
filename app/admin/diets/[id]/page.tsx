import { getCurrentUserData } from '@/lib/auth';
import { getDietPlan } from '@/app/actions/diets';
import { notFound } from 'next/navigation';
import { ArrowLeft, Target, Utensils, Flame } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

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

  return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom">
        {/* Header */}
        <div>
          <Link
            href="/admin/diets"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
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
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="capitalize">{plan.diet_preference?.replace('_', ' ')}</span>
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>{plan.total_calories} kcal</span>
               </div>
               <Link
                href={`/admin/diets/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Edit Plan
              </Link>
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Meals</h2>
          
          {meals.length > 0 ? (
             <div className="space-y-4">
                {meals.map((meal: any, index: number) => (
                   <div key={meal.id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-start gap-4">
                         <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                            <Utensils className="w-5 h-5" />
                         </div>
                         <div className="flex-1">
                            <div className="flex flex-wrap justify-between gap-2 mb-1">
                               <h4 className="font-semibold text-foreground">{meal.meal_name}</h4>
                               <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize font-medium">{meal.meal_type}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
                            
                            <div className="flex flex-wrap gap-3 text-xs">
                               <span className="text-orange-500 font-medium">{meal.calories} kcal</span>
                               <span className="text-muted-foreground">P: {meal.protein_g}g</span>
                               <span className="text-muted-foreground">C: {meal.carbs_g}g</span>
                               <span className="text-muted-foreground">F: {meal.fats_g}g</span>
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          ) : (
             <div className="text-center py-10 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No meals in this plan</p>
             </div>
          )}
        </div>
      </div>
  );
}
