import { getCurrentUserData } from '@/lib/auth';
import { getWorkoutPlan } from '@/app/actions/workouts';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import WorkoutPlanForm from '../../new/workout-plan-form';

interface EditWorkoutPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWorkoutPlanPage({ params }: EditWorkoutPlanPageProps) {
  const resolvedParams = await params;
  const user = await getCurrentUserData();
  
  if (!user?.gym_id || !user?.id) {
    redirect('/admin/dashboard');
  }
  
  const plan = await getWorkoutPlan(resolvedParams.id);
  
  if (!plan) {
    notFound();
  }

  // Transform exercises to match the form's expected format
  const initialExercises = plan.workout_exercises?.map((ex: any) => ({
    id: ex.id,
    day: ex.day,
    exercise_name: ex.exercise_name,
    description: ex.description || '',
    sets: ex.sets,
    reps: ex.reps,
    rest_seconds: ex.rest_seconds,
    video_url: ex.video_url || '',
  })) || [];

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link 
          href="/admin/workouts"
          className="p-2 hover:bg-muted rounded-full transition-colors touch-manipulation"
          aria-label="Back to workout plans"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Edit Workout Plan</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Update {plan.name}</p>
        </div>
      </div>

      <WorkoutPlanForm 
        gymId={user.gym_id} 
        createdBy={user.id}
        planId={resolvedParams.id}
        initialData={{
          name: plan.name,
          description: plan.description || '',
          difficulty: plan.difficulty,
          duration_weeks: plan.duration_weeks,
        }}
        initialExercises={initialExercises}
      />
    </div>
  );
}
