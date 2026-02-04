'use client';

import { useState } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';

interface EditRevenueButtonProps {
  currentValue: number;
  onUpdate: (newValue: number) => void;
}

export function EditRevenueButton({ currentValue, onUpdate }: EditRevenueButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentValue.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revenuePerAdmin: numValue })
      });

      if (response.ok) {
        onUpdate(numValue);
        setIsEditing(false);
      } else {
        alert('Failed to update revenue rate');
      }
    } catch (error) {
      alert('Error updating revenue rate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setValue(currentValue.toString());
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        title="Edit revenue rate"
      >
        <Pencil className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-white/20 rounded-lg overflow-hidden">
        <span className="px-2 text-white/80">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 px-2 py-1.5 bg-transparent text-white outline-none"
          autoFocus
          disabled={isLoading}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="p-2 bg-white/20 hover:bg-green-500/50 rounded-lg transition-colors"
        title="Save"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
      </button>
      <button
        onClick={handleCancel}
        disabled={isLoading}
        className="p-2 bg-white/20 hover:bg-red-500/50 rounded-lg transition-colors"
        title="Cancel"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
