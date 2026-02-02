'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, Save, Trash2, Utensils } from 'lucide-react';
import { createDietPlan } from '@/app/actions/diets';

interface DietPlanFormProps {
  gymId: string;
  createdBy: string;
  redirectPath?: string;
}

interface Meal {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  meal_name: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

export default function DietPlanForm({ gymId, createdBy, redirectPath = '/admin/diets' }: DietPlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [meals, setMeals] = useState<Meal[]>([]);

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        id: crypto.randomUUID(),
        meal_type: 'breakfast',
        meal_name: '',
        description: '',
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fats_g: 0,
      },
    ]);
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter((m) => m.id !== id));
  };

  const updateMeal = (id: string, field: keyof Meal, value: any) => {
    setMeals(meals.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createDietPlan({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        diet_preference: formData.get('diet_preference') as string,
        gymId,
        createdBy,
        meals,
      });

      if (result.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        alert(`Failed to create diet plan: ${result.error}`);
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
              placeholder="e.g., High Protein Diet"
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Describe the diet plan..."
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">Diet Preference</label>
            <select
              required
              name="diet_preference"
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="veg">Vegetarian</option>
              <option value="non_veg">Non-Vegetarian</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Meals</h2>
          <button
            type="button"
            onClick={addMeal}
            className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm sm:text-base touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Meal</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {meals.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-muted-foreground">
            <Utensils className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm sm:text-base">No meals added yet. Click "Add Meal" to start.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal, index) => (
              <div key={meal.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground text-sm sm:text-base">Meal {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeMeal(meal.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors touch-manipulation"
                    aria-label="Remove meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Meal Type</label>
                    <select
                      value={meal.meal_type}
                      onChange={(e) => updateMeal(meal.id, 'meal_type', e.target.value)}
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="snacks">Snacks</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Meal Name</label>
                    <input
                      type="text"
                      value={meal.meal_name}
                      onChange={(e) => updateMeal(meal.id, 'meal_name', e.target.value)}
                      placeholder="e.g., Oatmeal with fruits"
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <input
                      type="text"
                      value={meal.description}
                      onChange={(e) => updateMeal(meal.id, 'description', e.target.value)}
                      placeholder="Meal details..."
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Calories</label>
                    <input
                      type="number"
                      value={meal.calories || ''}
                      onChange={(e) => updateMeal(meal.id, 'calories', Number(e.target.value))}
                      placeholder="0"
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Protein (g)</label>
                    <input
                      type="number"
                      value={meal.protein_g || ''}
                      onChange={(e) => updateMeal(meal.id, 'protein_g', Number(e.target.value))}
                      placeholder="0"
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Carbs (g)</label>
                    <input
                      type="number"
                      value={meal.carbs_g || ''}
                      onChange={(e) => updateMeal(meal.id, 'carbs_g', Number(e.target.value))}
                      placeholder="0"
                      className="w-full p-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Fats (g)</label>
                    <input
                      type="number"
                      value={meal.fats_g || ''}
                      onChange={(e) => updateMeal(meal.id, 'fats_g', Number(e.target.value))}
                      placeholder="0"
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
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Create Diet Plan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
