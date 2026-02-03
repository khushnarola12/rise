'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { deleteWorkoutPlan } from '@/app/actions/workouts';
import { deleteDietPlan } from '@/app/actions/diets';
import { cn } from '@/lib/utils';

interface PlanActionsMenuProps {
  planId: string;
  planType: 'workout' | 'diet';
  planName: string;
}

export function PlanActionsMenu({ planId, planType, planName }: PlanActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowConfirm(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = planType === 'workout' 
        ? await deleteWorkoutPlan(planId)
        : await deleteDietPlan(planId);
      
      if (!result.success) {
        alert(result.error || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting');
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
      setShowConfirm(false);
    }
  };

  const editPath = planType === 'workout' 
    ? `/admin/workouts/${planId}/edit`
    : `/admin/diets/${planId}/edit`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setShowConfirm(false);
        }}
        className={cn(
          "p-1.5 rounded-lg transition-all duration-200 touch-manipulation",
          "hover:bg-muted/80 active:scale-95",
          isOpen ? "bg-muted" : "bg-muted/50"
        )}
        aria-label="Plan actions"
      >
        <MoreVertical className={cn(
          "w-5 h-5 transition-transform duration-200",
          isOpen ? "text-foreground rotate-90" : "text-muted-foreground"
        )} />
      </button>

      {/* Dropdown Menu */}
      <div className={cn(
        "absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden",
        "transition-all duration-200 origin-top-right",
        isOpen 
          ? "opacity-100 scale-100 translate-y-0" 
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      )}>
        {!showConfirm ? (
          <>
            <Link
              href={editPath}
              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <Edit className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              Edit Plan
            </Link>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full text-left group"
            >
              <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              Delete Plan
            </button>
          </>
        ) : (
          <div className="p-4 space-y-3 animate-in">
            <p className="text-sm text-foreground">
              Delete <span className="font-semibold text-primary">{planName}</span>?
            </p>
            <p className="text-xs text-muted-foreground">
              This will also remove all user assignments.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-3 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-all duration-200 active:scale-95"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

