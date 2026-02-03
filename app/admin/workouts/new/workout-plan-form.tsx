'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, Save, Trash2, Dumbbell } from 'lucide-react';
import { createWorkoutPlan, updateWorkoutPlan } from '@/app/actions/workouts';

interface WorkoutPlanFormProps {
  gymId: string;
  createdBy: string;
  redirectPath?: string;
  // Edit mode props
  planId?: string;
  initialData?: {
    name: string;
    description: string;
    difficulty: string;
    duration_weeks: number;
  };
  initialExercises?: Exercise[];
}

interface Exercise {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  exercise_name: string;
  description: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  video_url: string;
}

export default function WorkoutPlanForm({ 
  gymId, 
  createdBy, 
  redirectPath = '/admin/workouts',
  planId,
  initialData,
  initialExercises = []
}: WorkoutPlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [exercises, setExercises] = useState<Exercise[]>(
    initialExercises.map(e => ({ ...e, id: e.id || crypto.randomUUID() }))
  );
  
  const isEditMode = !!planId;

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: crypto.randomUUID(),
        day: 'monday',
        exercise_name: '',
        description: '',
        sets: 3,
        reps: 10,
        rest_seconds: 60,
        video_url: '',
      },
    ]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const planData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        difficulty: formData.get('difficulty') as string,
        duration_weeks: Number(formData.get('duration_weeks')),
        gymId,
        createdBy,
        exercises,
      };

      const result = isEditMode 
        ? await updateWorkoutPlan(planId!, planData)
        : await createWorkoutPlan(planData);

      if (result.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        alert(`Failed to ${isEditMode ? 'update' : 'create'} workout plan: ${result.error}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Basic Info */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6 space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Basic Information</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">Plan Name</label>
            <input
              required
              type="text"
              name="name"
              defaultValue={initialData?.name || ''}
              placeholder="e.g., Beginner Full Body"
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={initialData?.description || ''}
              placeholder="Describe the workout plan..."
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">Difficulty</label>
            <select
              required
              name="difficulty"
              defaultValue={initialData?.difficulty || 'beginner'}
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">Duration (weeks)</label>
            <input
              required
              type="number"
              name="duration_weeks"
              min="1"
              max="52"
              defaultValue={initialData?.duration_weeks || 4}
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Exercises</h2>
          <button
            type="button"
            onClick={addExercise}
            className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm sm:text-base touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Exercise</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {exercises.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-muted-foreground">
            <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm sm:text-base">No exercises added yet. Click "Add Exercise" to start.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div key={exercise.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground text-sm sm:text-base">Exercise {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors touch-manipulation"
                    aria-label="Remove exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Day</label>
                    <select
                      value={exercise.day}
                      onChange={(e) => updateExercise(exercise.id, 'day', e.target.value)}
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary capitalize"
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Exercise Name</label>
                    <input
                      type="text"
                      value={exercise.exercise_name}
                      onChange={(e) => updateExercise(exercise.id, 'exercise_name', e.target.value)}
                      placeholder="e.g., Bench Press"
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <input
                      type="text"
                      value={exercise.description}
                      onChange={(e) => updateExercise(exercise.id, 'description', e.target.value)}
                      placeholder="Exercise instructions..."
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Sets</label>
                    <input
                      type="number"
                      value={exercise.sets || ''}
                      onChange={(e) => updateExercise(exercise.id, 'sets', Number(e.target.value))}
                      placeholder="3"
                      min="1"
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Reps</label>
                    <input
                      type="number"
                      value={exercise.reps || ''}
                      onChange={(e) => updateExercise(exercise.id, 'reps', Number(e.target.value))}
                      placeholder="10"
                      min="1"
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Rest (seconds)</label>
                    <input
                      type="number"
                      value={exercise.rest_seconds || ''}
                      onChange={(e) => updateExercise(exercise.id, 'rest_seconds', Number(e.target.value))}
                      placeholder="60"
                      min="0"
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Video URL (optional)</label>
                    <input
                      type="url"
                      value={exercise.video_url}
                      onChange={(e) => updateExercise(exercise.id, 'video_url', e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Link
          href={redirectPath}
          className="w-full sm:w-auto px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors text-center touch-manipulation"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isEditMode ? 'Update Workout Plan' : 'Create Workout Plan'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
