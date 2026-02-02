'use client';

import { useState, useTransition } from 'react';
import { X, Dumbbell, Utensils, User, Loader2, Check, AlertCircle } from 'lucide-react';
import { 
  assignTrainerToMember, 
  assignWorkoutPlanToMember, 
  assignDietPlanToMember,
  unassignTrainerFromMember,
  unassignWorkoutPlanFromMember,
  unassignDietPlanFromMember
} from '@/app/actions/assignments';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'trainer' | 'workout' | 'diet';
  memberId: string;
  memberName: string;
  availableItems: Array<{ id: string; name?: string; first_name?: string; last_name?: string; [key: string]: any }>;
  currentAssignment?: { id: string; name?: string } | null;
}

export function AssignmentModal({
  isOpen,
  onClose,
  type,
  memberId,
  memberName,
  availableItems,
  currentAssignment,
}: AssignmentModalProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [duration, setDuration] = useState<number>(4);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const title = {
    trainer: 'Assign Trainer',
    workout: 'Assign Workout Plan',
    diet: 'Assign Diet Plan',
  }[type];

  const icon = {
    trainer: User,
    workout: Dumbbell,
    diet: Utensils,
  }[type];

  const Icon = icon;

  const handleAssign = () => {
    if (!selectedId) {
      setMessage({ type: 'error', text: 'Please select an item' });
      return;
    }

    startTransition(async () => {
      let result;
      
      switch (type) {
        case 'trainer':
          result = await assignTrainerToMember(selectedId, memberId);
          break;
        case 'workout':
          result = await assignWorkoutPlanToMember(selectedId, memberId, duration);
          break;
        case 'diet':
          result = await assignDietPlanToMember(selectedId, memberId, duration);
          break;
      }

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Assigned successfully' });
        setTimeout(() => {
          onClose();
          setMessage(null);
          setSelectedId('');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to assign' });
      }
    });
  };

  const handleUnassign = () => {
    startTransition(async () => {
      let result;
      
      switch (type) {
        case 'trainer':
          if (currentAssignment) {
            result = await unassignTrainerFromMember(currentAssignment.id, memberId);
          }
          break;
        case 'workout':
          result = await unassignWorkoutPlanFromMember(memberId);
          break;
        case 'diet':
          result = await unassignDietPlanFromMember(memberId);
          break;
      }

      if (result?.success) {
        setMessage({ type: 'success', text: 'Unassigned successfully' });
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result?.error || 'Failed to unassign' });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">for {memberName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Assignment */}
        {currentAssignment && (
          <div className="p-4 bg-muted/30 border-b border-border">
            <p className="text-sm text-muted-foreground mb-2">Currently Assigned:</p>
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {currentAssignment.name || 'Unknown'}
              </span>
              <button
                onClick={handleUnassign}
                disabled={isPending}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Message */}
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-red-500/10 text-red-500'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Selection List */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select {type === 'trainer' ? 'Trainer' : 'Plan'}
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No {type}s available
                </p>
              ) : (
                availableItems.map((item) => {
                  const itemName = type === 'trainer' 
                    ? `${item.first_name} ${item.last_name}`
                    : item.name;
                  
                  return (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedId === item.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="assignment"
                        value={item.id}
                        checked={selectedId === item.id}
                        onChange={() => setSelectedId(item.id)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedId === item.id ? 'border-primary' : 'border-muted-foreground/30'
                      }`}>
                        {selectedId === item.id && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{itemName}</p>
                        {type !== 'trainer' && (
                          <p className="text-xs text-muted-foreground">
                            {item.difficulty && `${item.difficulty} • `}
                            {item.duration_weeks && `${item.duration_weeks} weeks`}
                            {item.diet_preference && item.diet_preference}
                            {item.total_calories && ` • ${item.total_calories} kcal`}
                          </p>
                        )}
                        {type === 'trainer' && item.email && (
                          <p className="text-xs text-muted-foreground">{item.email}</p>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Duration (for workout/diet) */}
          {type !== 'trainer' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 4)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={isPending || !selectedId}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
