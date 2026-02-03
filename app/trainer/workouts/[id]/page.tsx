import { getCurrentUserData } from '@/lib/auth';
import { getWorkoutPlan } from '@/app/actions/workouts';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Target, PlayCircle, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { YouTubeEmbed } from '@/components/youtube-embed';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrainerWorkoutDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserData();

  if (!user) {
    return notFound();
  }

  const plan = await getWorkoutPlan(id);

  if (!plan) {
    notFound();
  }

  // Verify access (same gym)
  if (plan.gym_id !== user.gym_id) {
    return notFound();
  }

  const exercises = plan.workout_exercises?.sort((a: any, b: any) => a.exercise_order - b.exercise_order) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom">
      {/* Header */}
      <div>
        <Link
          href="/trainer/workouts"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workouts
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
            {plan.difficulty && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="capitalize">{plan.difficulty}</span>
              </div>
            )}
            {plan.duration_weeks && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{plan.duration_weeks} Weeks</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Exercises</h2>
        
        {exercises.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {exercises.map((exercise: any, index: number) => (
              <div
                key={exercise.id}
                className="p-4 bg-muted/30 rounded-lg border border-border/50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground">
                      {exercise.exercise_name}
                    </h4>
                    {exercise.day && (
                      <p className="text-xs text-muted-foreground capitalize mb-2">
                        {exercise.day}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 text-xs mb-2">
                      {exercise.sets && (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">
                          {exercise.sets} sets
                        </span>
                      )}
                      {exercise.reps && (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded">
                          {exercise.reps} reps
                        </span>
                      )}
                      {exercise.rest_seconds && (
                        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded">
                          {exercise.rest_seconds}s rest
                        </span>
                      )}
                    </div>
                    {exercise.description && (
                      <p className="text-sm text-muted-foreground">
                        {exercise.description}
                      </p>
                    )}
                    {exercise.video_url && <YouTubeEmbed url={exercise.video_url} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No exercises in this plan</p>
          </div>
        )}
      </div>
    </div>
  );
}
