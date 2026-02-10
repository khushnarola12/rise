import { getCurrentUserData } from '@/lib/auth';
import { getWorkoutPlan } from '@/app/actions/workouts';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Target, Dumbbell, Clock, Repeat, Timer } from 'lucide-react';
import Link from 'next/link';
import { YouTubeEmbed } from '@/components/youtube-embed';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  advanced: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
} as const;

export default async function AdminWorkoutDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUserData();

  if (!user || !['superuser', 'admin'].includes(user.role)) {
    return notFound();
  }

  const plan = await getWorkoutPlan(id);

  if (!plan) {
    notFound();
  }

  if (plan.gym_id !== user.gym_id) {
    return notFound();
  }

  const exercises = plan.workout_exercises?.sort((a: any, b: any) => a.exercise_order - b.exercise_order) || [];

  // Group exercises by day
  const exercisesByDay = exercises.reduce((acc: Record<string, any[]>, ex: any) => {
    const day = ex.day || 'General';
    if (!acc[day]) acc[day] = [];
    acc[day].push(ex);
    return acc;
  }, {});

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'General'];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-bottom duration-500">
        <Link
          href="/admin/workouts"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group/back"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover/back:-translate-x-1" />
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
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${DIFFICULTY_COLORS[plan.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.beginner}`}>
                <Target className="w-4 h-4" />
                <span className="capitalize font-medium">{plan.difficulty}</span>
              </div>
            )}
            {plan.duration_weeks && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-sm">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{plan.duration_weeks} Weeks</span>
              </div>
            )}
            <Link
              href={`/admin/workouts/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all text-sm font-medium shadow-lg shadow-primary/20"
            >
              Edit Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Exercises grouped by day */}
      {Object.keys(exercisesByDay).length > 0 ? (
        <div className="space-y-6">
          {dayOrder
            .filter(day => exercisesByDay[day])
            .map((day, dayIndex) => (
              <div 
                key={day} 
                className="bg-card border border-border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both"
                style={{ animationDelay: `${(dayIndex + 1) * 100}ms` }}
              >
                <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-purple-500/10 to-transparent border-b border-border">
                  <h2 className="text-base sm:text-lg font-bold text-foreground capitalize flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                    {day}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({exercisesByDay[day].length} exercises)
                    </span>
                  </h2>
                </div>
                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {exercisesByDay[day].map((exercise: any, index: number) => (
                    <div
                      key={exercise.id}
                      className="p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-border transition-all duration-300 hover:shadow-md group/card"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm flex-shrink-0 group-hover/card:bg-purple-500/20 transition-colors">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground text-sm sm:text-base">
                            {exercise.exercise_name}
                          </h4>
                          <div className="flex flex-wrap gap-1.5 text-xs mt-2 mb-2">
                            {exercise.sets && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md font-medium">
                                <Repeat className="w-3 h-3" />
                                {exercise.sets} sets
                              </span>
                            )}
                            {exercise.reps && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-medium">
                                {exercise.reps} reps
                              </span>
                            )}
                            {exercise.rest_seconds && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-md font-medium">
                                <Timer className="w-3 h-3" />
                                {exercise.rest_seconds}s rest
                              </span>
                            )}
                          </div>
                          {exercise.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {exercise.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {exercise.video_url && (
                        <div className="mt-3">
                          <YouTubeEmbed url={exercise.video_url} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center animate-in fade-in duration-500">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-lg font-medium text-muted-foreground">No exercises in this plan</p>
          <p className="text-sm text-muted-foreground mt-1">Edit the plan to add exercises</p>
        </div>
      )}
    </div>
  );
}
