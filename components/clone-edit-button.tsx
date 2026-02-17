'use client';

import { useState } from 'react';
import { Copy, Loader2 } from 'lucide-react';
import { cloneWorkoutPlan } from '@/app/actions/workouts';
import { cloneDietPlan } from '@/app/actions/diets';
import { useRouter } from 'next/navigation';

interface CloneEditButtonProps {
  planId: string;
  planType: 'workout' | 'diet';
  userGymId: string;
  userId: string;
  editBasePath: string; // e.g. '/admin/workouts' or '/admin/diets'
}

export function CloneEditButton({ planId, planType, userGymId, userId, editBasePath }: CloneEditButtonProps) {
  const [isCloning, setIsCloning] = useState(false);
  const router = useRouter();

  const handleCloneAndEdit = async () => {
    setIsCloning(true);
    try {
      const result = planType === 'workout'
        ? await cloneWorkoutPlan(planId, userGymId, userId)
        : await cloneDietPlan(planId, userGymId, userId);

      if (result.success && result.newPlanId) {
        router.push(`${editBasePath}/${result.newPlanId}/edit`);
      } else {
        alert(result.error || 'Failed to clone plan');
      }
    } catch (error) {
      console.error('Clone error:', error);
      alert('An error occurred while cloning');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <button
      onClick={handleCloneAndEdit}
      disabled={isCloning}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all text-sm font-medium shadow-lg shadow-primary/20 disabled:opacity-50"
    >
      {isCloning ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
      {isCloning ? 'Cloning...' : 'Clone & Edit'}
    </button>
  );
}
