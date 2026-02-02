'use client';

import { useState, useTransition, useEffect } from 'react';
import { 
  Check, 
  LogOut, 
  Scale, 
  Target, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import { 
  selfCheckIn, 
  selfCheckOut, 
  logOwnProgress, 
  updateOwnProfile,
  getTodayCheckInStatus 
} from '@/app/actions/member-self-service';

interface QuickActionsClientProps {
  profile: any;
  currentWeight?: number;
}

export function MemberQuickActions({ profile, currentWeight }: QuickActionsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState({ checkedIn: false, checkedOut: false });

  const [progressData, setProgressData] = useState({
    weight_kg: currentWeight?.toString() || '',
    body_fat_percentage: '',
    muscle_mass_kg: '',
    notes: '',
  });

  const [profileData, setProfileData] = useState({
    height_cm: profile?.height_cm || '',
    target_weight_kg: profile?.target_weight_kg || '',
    fitness_goal: profile?.fitness_goal || '',
    experience_level: profile?.experience_level || '',
    health_conditions: profile?.health_conditions || '',
  });

  useEffect(() => {
    getTodayCheckInStatus().then(setCheckInStatus);
  }, []);

  const handleCheckIn = () => {
    startTransition(async () => {
      const result = await selfCheckIn();
      setMessage({ type: result.success ? 'success' : 'error', text: result.message || result.error || '' });
      if (result.success) setCheckInStatus({ ...checkInStatus, checkedIn: true });
    });
  };

  const handleCheckOut = () => {
    startTransition(async () => {
      const result = await selfCheckOut();
      setMessage({ type: result.success ? 'success' : 'error', text: result.message || result.error || '' });
      if (result.success) setCheckInStatus({ ...checkInStatus, checkedOut: true });
    });
  };

  const handleLogProgress = () => {
    if (!progressData.weight_kg) {
      setMessage({ type: 'error', text: 'Weight is required' });
      return;
    }

    startTransition(async () => {
      const result = await logOwnProgress({
        weight_kg: Number(progressData.weight_kg),
        body_fat_percentage: progressData.body_fat_percentage ? Number(progressData.body_fat_percentage) : undefined,
        muscle_mass_kg: progressData.muscle_mass_kg ? Number(progressData.muscle_mass_kg) : undefined,
        notes: progressData.notes || undefined,
      });

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Progress logged!' });
        setShowProgressForm(false);
        setProgressData({ weight_kg: '', body_fat_percentage: '', muscle_mass_kg: '', notes: '' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed' });
      }
    });
  };

  const handleUpdateProfile = () => {
    startTransition(async () => {
      const result = await updateOwnProfile({
        height_cm: profileData.height_cm ? Number(profileData.height_cm) : undefined,
        target_weight_kg: profileData.target_weight_kg ? Number(profileData.target_weight_kg) : undefined,
        fitness_goal: profileData.fitness_goal || undefined,
        experience_level: profileData.experience_level || undefined,
        health_conditions: profileData.health_conditions || undefined,
      });

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Updated!' });
        setShowProfileForm(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed' });
      }
    });
  };

  if (message) {
    setTimeout(() => setMessage(null), 4000);
  }

  return (
    <div className="space-y-4">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          message.type === 'success' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Quick Actions Card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Quick Actions</h3>

        {/* Status Banner */}
        {checkInStatus.checkedIn && !checkInStatus.checkedOut && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-300">You're checked in! Have a great workout!</span>
          </div>
        )}

        {checkInStatus.checkedOut && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">Session complete! See you next time!</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Check In */}
          <button
            onClick={handleCheckIn}
            disabled={isPending || checkInStatus.checkedIn}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-colors ${
              checkInStatus.checkedIn
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : checkInStatus.checkedIn ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            <span>{checkInStatus.checkedIn ? 'Checked In' : 'Check In'}</span>
          </button>

          {/* Check Out */}
          <button
            onClick={handleCheckOut}
            disabled={isPending || !checkInStatus.checkedIn || checkInStatus.checkedOut}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-colors ${
              checkInStatus.checkedOut
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                : !checkInStatus.checkedIn
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
            <span>{checkInStatus.checkedOut ? 'Done' : 'Check Out'}</span>
          </button>

          {/* Log Progress */}
          <button
            onClick={() => setShowProgressForm(!showProgressForm)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-colors ${
              showProgressForm 
                ? 'bg-purple-500 text-white' 
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            <Scale className="w-5 h-5" />
            <span>Log Progress</span>
          </button>

          {/* Edit Goals */}
          <button
            onClick={() => setShowProfileForm(!showProfileForm)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-colors ${
              showProfileForm 
                ? 'bg-blue-500 text-white' 
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            <Target className="w-5 h-5" />
            <span>Edit Goals</span>
          </button>
        </div>
      </div>

      {/* Progress Form */}
      {showProgressForm && (
        <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Log Progress</h3>
            <button onClick={() => setShowProgressForm(false)} className="p-1 hover:bg-muted rounded">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Weight (kg) *</label>
              <input
                type="number"
                value={progressData.weight_kg}
                onChange={(e) => setProgressData({ ...progressData, weight_kg: e.target.value })}
                className="w-full"
                step="0.1"
                placeholder="Enter weight"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Body Fat %</label>
              <input
                type="number"
                value={progressData.body_fat_percentage}
                onChange={(e) => setProgressData({ ...progressData, body_fat_percentage: e.target.value })}
                className="w-full"
                step="0.1"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Muscle Mass (kg)</label>
              <input
                type="number"
                value={progressData.muscle_mass_kg}
                onChange={(e) => setProgressData({ ...progressData, muscle_mass_kg: e.target.value })}
                className="w-full"
                step="0.1"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
              <input
                type="text"
                value={progressData.notes}
                onChange={(e) => setProgressData({ ...progressData, notes: e.target.value })}
                className="w-full"
                placeholder="Optional"
              />
            </div>
          </div>
          <button
            onClick={handleLogProgress}
            disabled={isPending}
            className="mt-4 w-full py-2.5 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Progress
          </button>
        </div>
      )}

      {/* Profile Form */}
      {showProfileForm && (
        <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Update Goals</h3>
            <button onClick={() => setShowProfileForm(false)} className="p-1 hover:bg-muted rounded">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Height (cm)</label>
              <input
                type="number"
                value={profileData.height_cm}
                onChange={(e) => setProfileData({ ...profileData, height_cm: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Target Weight (kg)</label>
              <input
                type="number"
                value={profileData.target_weight_kg}
                onChange={(e) => setProfileData({ ...profileData, target_weight_kg: e.target.value })}
                className="w-full"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fitness Goal</label>
              <select
                value={profileData.fitness_goal}
                onChange={(e) => setProfileData({ ...profileData, fitness_goal: e.target.value })}
                className="w-full"
              >
                <option value="">Select goal</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
                <option value="endurance">Endurance</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Experience Level</label>
              <select
                value={profileData.experience_level}
                onChange={(e) => setProfileData({ ...profileData, experience_level: e.target.value })}
                className="w-full"
              >
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleUpdateProfile}
            disabled={isPending}
            className="mt-4 w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Goals
          </button>
        </div>
      )}
    </div>
  );
}
