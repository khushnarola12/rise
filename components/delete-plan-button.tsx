'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteWorkoutPlan } from '@/app/actions/workouts';
import { deleteDietPlan } from '@/app/actions/diets';
import { useRouter } from 'next/navigation';

interface DeletePlanButtonProps {
  planId: string;
  planType: 'workout' | 'diet';
  planName: string;
  redirectPath: string;
}

export function DeletePlanButton({ planId, planType, planName, redirectPath }: DeletePlanButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = planType === 'workout'
        ? await deleteWorkoutPlan(planId)
        : await deleteDietPlan(planId);

      if (result.success) {
        router.push(redirectPath);
      } else {
        alert(result.error || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in duration-200">
        <p className="text-sm text-foreground flex-1">
          Delete <span className="font-semibold text-red-500">{planName}</span>?
        </p>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-3 py-1.5 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all active:scale-95 flex items-center gap-1.5"
        >
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 active:scale-[0.97] transition-all text-sm font-medium"
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  );
}
