'use client';

import { useState } from 'react';
import { IndianRupee, Pencil, Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RevenueCardProps {
  totalAdmins: number;
  activeAdmins: number;
  revenuePerAdmin: number;
  editable?: boolean;
}

export function RevenueCard({ 
  totalAdmins, 
  activeAdmins, 
  revenuePerAdmin: initialRate, 
  editable = false 
}: RevenueCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [revenuePerAdmin, setRevenuePerAdmin] = useState(initialRate);
  const [inputValue, setInputValue] = useState(initialRate.toString());
  const [isLoading, setIsLoading] = useState(false);

  // Only active admins contribute to revenue
  const totalRevenue = activeAdmins * revenuePerAdmin;
  const inactiveAdmins = totalAdmins - activeAdmins;

  const handleSave = async () => {
    const numValue = parseInt(inputValue);
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
        setRevenuePerAdmin(numValue);
        setIsEditing(false);
        router.refresh(); // Refresh to update other components
      } else {
        alert('Failed to update revenue rate');
      }
    } catch {
      alert('Error updating revenue rate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setInputValue(revenuePerAdmin.toString());
    setIsEditing(false);
  };

  return (
    <div className="bg-emerald-600 rounded-2xl p-8 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-emerald-100 text-sm font-medium">Total Revenue</p>
            {editable && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Edit revenue rate"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <h2 className="text-5xl font-bold mb-3">₹{totalRevenue.toLocaleString()}</h2>
          
          {isEditing ? (
            <div className="flex items-center gap-3">
              <span className="text-emerald-100">{activeAdmins} Active Admin{activeAdmins !== 1 ? 's' : ''} ×</span>
              <div className="flex items-center bg-white/20 rounded-lg overflow-hidden">
                <span className="px-2 text-white/80">₹</span>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-24 px-2 py-1.5 bg-transparent text-white outline-none text-lg font-medium"
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
            </div>
          ) : null}
        </div>
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
          <IndianRupee className="w-10 h-10" />
        </div>
      </div>
    </div>
  );
}
