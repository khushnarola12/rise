import { getCurrentUserData } from '@/lib/auth';
import { getDietPlan } from '@/app/actions/diets';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DietPlanForm from '../../new/diet-plan-form';

interface EditDietPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDietPlanPage({ params }: EditDietPlanPageProps) {
  const resolvedParams = await params;
  const user = await getCurrentUserData();
  
  if (!user?.gym_id || !user?.id) {
    redirect('/admin/dashboard');
  }
  
  const plan = await getDietPlan(resolvedParams.id);
  
  if (!plan) {
    notFound();
  }

  // Transform meals to match the form's expected format
  const initialMeals = plan.diet_plan_meals?.map((meal: any) => ({
    id: meal.id,
    meal_type: meal.meal_type,
    meal_name: meal.meal_name,
    description: meal.description || '',
    calories: meal.calories,
    protein_g: meal.protein_g,
    carbs_g: meal.carbs_g,
    fats_g: meal.fats_g,
  })) || [];

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link 
          href="/admin/diets"
          className="p-2 hover:bg-muted rounded-full transition-colors touch-manipulation"
          aria-label="Back to diet plans"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Edit Diet Plan</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Update {plan.name}</p>
        </div>
      </div>

      <DietPlanForm 
        gymId={user.gym_id} 
        createdBy={user.id}
        planId={resolvedParams.id}
        initialData={{
          name: plan.name,
          description: plan.description || '',
          diet_preference: plan.diet_preference,
        }}
        initialMeals={initialMeals}
      />
    </div>
  );
}
