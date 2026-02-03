'use client';

import { useState, useTransition } from 'react';
import { User, Dumbbell, Utensils, UserCheck, Plus, X, Scale, TrendingUp, Clock, Loader2, Check, AlertCircle, Calendar, ClipboardList, MoreVertical } from 'lucide-react';
import { AssignmentModal } from '@/components/assignment-modal';
import { logMemberProgress, markAttendance, updateMemberProfile } from '@/app/actions/assignments';

interface MemberManagementClientProps {
  memberId: string;
  memberName: string;
  profile: any;
  trainerAssignments: any[];
  activeWorkout: any;
  activeDiet: any;
  availableTrainers: any[];
  availableWorkouts: any[];
  availableDiets: any[];
  recentProgress: any[];
  recentAttendance: any[];
  activeMembership?: any;
}

export function MemberManagementClient({
  memberId,
  memberName,
  profile,
  trainerAssignments,
  activeWorkout,
  activeDiet,
  availableTrainers,
  availableWorkouts,
  availableDiets,
  recentProgress,
  recentAttendance,
  activeMembership,
}: MemberManagementClientProps) {
  const [modalType, setModalType] = useState<'trainer' | 'workout' | 'diet' | null>(null);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Progress form state
  const [progressData, setProgressData] = useState({
    weight_kg: profile?.current_weight_kg || '',
    body_fat_percentage: '',
    muscle_mass_kg: '',
    notes: '',
  });

  // Profile form state
  const [profileData, setProfileData] = useState({
    height_cm: profile?.height_cm || '',
    current_weight_kg: profile?.current_weight_kg || '',
    target_weight_kg: profile?.target_weight_kg || '',
    fitness_goal: profile?.fitness_goal || '',
    experience_level: profile?.experience_level || '',
    health_conditions: profile?.health_conditions || '',
    membership_start_date: activeMembership?.start_date || '',
    membership_end_date: activeMembership?.end_date || '',
  });

  const handleLogProgress = () => {
    if (!progressData.weight_kg) {
      setMessage({ type: 'error', text: 'Weight is required' });
      return;
    }

    startTransition(async () => {
      const result = await logMemberProgress(memberId, {
        weight_kg: Number(progressData.weight_kg),
        body_fat_percentage: progressData.body_fat_percentage ? Number(progressData.body_fat_percentage) : undefined,
        muscle_mass_kg: progressData.muscle_mass_kg ? Number(progressData.muscle_mass_kg) : undefined,
        notes: progressData.notes || undefined,
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Progress logged!' });
        setShowProgressForm(false);
        setProgressData({ weight_kg: '', body_fat_percentage: '', muscle_mass_kg: '', notes: '' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed' });
      }
    });
  };

  const handleUpdateProfile = () => {
    startTransition(async () => {
      const result = await updateMemberProfile(memberId, {
        height_cm: profileData.height_cm ? Number(profileData.height_cm) : undefined,
        current_weight_kg: profileData.current_weight_kg ? Number(profileData.current_weight_kg) : undefined,
        target_weight_kg: profileData.target_weight_kg ? Number(profileData.target_weight_kg) : undefined,
        fitness_goal: profileData.fitness_goal || undefined,
        experience_level: profileData.experience_level || undefined,
        health_conditions: profileData.health_conditions || undefined,
        membership_start_date: profileData.membership_start_date || undefined,
        membership_end_date: profileData.membership_end_date || undefined,
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated!' });
        setShowProfileForm(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed' });
      }
    });
  };

  const handleAttendance = (action: 'check_in' | 'check_out') => {
    startTransition(async () => {
      const result = await markAttendance(memberId, action);
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message || result.error || 'Done' 
      });
    });
  };

  // Calculate membership status logic for UI
  let daysRemaining = 0;
  let membershipStatus = 'No Plan';
  
  if (activeMembership?.end_date) {
    const end = new Date(activeMembership.end_date);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    membershipStatus = daysRemaining > 0 ? 'Active' : 'Expired';
  }

  // Auto-clear messages
  if (message) {
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <>
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments Section */}
        <div className="space-y-4">
          {/* Membership Status Card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className={`w-5 h-5 ${
                !activeMembership ? 'text-muted-foreground' : 
                daysRemaining > 7 ? 'text-green-500' : 'text-red-500'
              }`} />
              <h3 className="font-semibold text-foreground">Membership Status</h3>
            </div>
            {activeMembership ? (
              <div className={`p-4 rounded-lg border flex flex-col gap-2 ${
                daysRemaining > 7 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Days Remaining</span>
                  <span className={`text-sm font-bold ${
                    daysRemaining > 7 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {daysRemaining > 0 ? `${daysRemaining} Days` : 'Expired'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">End Date</span>
                   <span className="font-medium">{new Date(activeMembership.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
             <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">No active membership found.</p>
                <button 
                  onClick={() => setShowProfileForm(true)}
                  className="text-xs text-primary mt-1 hover:underline"
                >
                  Set dates in Edit Profile
                </button>
             </div>
            )}
          </div>

          {/* Trainer Assignment */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Assigned Trainer</h3>
              </div>
              <button
                onClick={() => setModalType('trainer')}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <div className="hidden sm:flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  {trainerAssignments.length > 0 ? 'Change' : 'Assign'}
                </div>
                <div className="sm:hidden flex items-center gap-1 text-xs text-primary font-medium">
                  <span>Edit</span>
                  <MoreVertical className="w-4 h-4" />
                </div>
              </button>
            </div>
            {trainerAssignments.length > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">{trainerAssignments[0].users?.first_name} {trainerAssignments[0].users?.last_name}</p>
                  <p className="text-xs text-muted-foreground">{trainerAssignments[0].users?.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No trainer assigned</p>
            )}
          </div>

          {/* Workout Assignment */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-foreground">Workout Plan</h3>
              </div>
              <button
                onClick={() => setModalType('workout')}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <div className="hidden sm:flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  {activeWorkout ? 'Change' : 'Assign'}
                </div>
                <div className="sm:hidden flex items-center gap-1 text-xs text-primary font-medium">
                  <span>Edit</span>
                  <MoreVertical className="w-4 h-4" />
                </div>
              </button>
            </div>
            {activeWorkout ? (
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <p className="font-medium text-foreground">{activeWorkout.workout_plans?.name}</p>
                <p className="text-sm text-muted-foreground">{activeWorkout.workout_plans?.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-500 rounded">
                    {activeWorkout.workout_plans?.difficulty}
                  </span>
                  <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                    {activeWorkout.workout_plans?.duration_weeks} weeks
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No workout plan assigned</p>
            )}
          </div>

          {/* Diet Assignment */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-foreground">Diet Plan</h3>
              </div>
              <button
                onClick={() => setModalType('diet')}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <div className="hidden sm:flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  {activeDiet ? 'Change' : 'Assign'}
                </div>
                <div className="sm:hidden flex items-center gap-1 text-xs text-primary font-medium">
                  <span>Edit</span>
                  <MoreVertical className="w-4 h-4" />
                </div>
              </button>
            </div>
            {activeDiet ? (
              <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                <p className="font-medium text-foreground">{activeDiet.diet_plans?.name}</p>
                <p className="text-sm text-muted-foreground">{activeDiet.diet_plans?.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded">
                    {activeDiet.diet_plans?.diet_preference}
                  </span>
                  <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                    {activeDiet.diet_plans?.total_calories} kcal
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No diet plan assigned</p>
            )}
          </div>
        </div>

        {/* Actions & Info Section */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAttendance('check_in')}
                disabled={isPending}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <ClipboardList className="w-4 h-4" />
                Check In
              </button>
              <button
                onClick={() => handleAttendance('check_out')}
                disabled={isPending}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                Check Out
              </button>
              <button
                onClick={() => setShowProgressForm(!showProgressForm)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                <Scale className="w-4 h-4" />
                Log Progress
              </button>
              <button
                onClick={() => setShowProfileForm(!showProfileForm)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
              >
                <User className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Progress Form */}
          {showProgressForm && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Log Progress</h3>
                <button onClick={() => setShowProgressForm(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Weight (kg) *</label>
                  <input
                    type="number"
                    value={progressData.weight_kg}
                    onChange={(e) => setProgressData({ ...progressData, weight_kg: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    step="0.1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Body Fat %</label>
                    <input
                      type="number"
                      value={progressData.body_fat_percentage}
                      onChange={(e) => setProgressData({ ...progressData, body_fat_percentage: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Muscle Mass (kg)</label>
                    <input
                      type="number"
                      value={progressData.muscle_mass_kg}
                      onChange={(e) => setProgressData({ ...progressData, muscle_mass_kg: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                      step="0.1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Notes</label>
                  <textarea
                    value={progressData.notes}
                    onChange={(e) => setProgressData({ ...progressData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleLogProgress}
                  disabled={isPending}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Progress'}
                </button>
              </div>
            </div>
          )}

          {/* Profile Form */}
          {showProfileForm && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Edit Profile</h3>
                <button onClick={() => setShowProfileForm(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Height (cm)</label>
                    <input
                      type="number"
                      value={profileData.height_cm}
                      onChange={(e) => setProfileData({ ...profileData, height_cm: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Current Weight (kg)</label>
                    <input
                      type="number"
                      value={profileData.current_weight_kg}
                      onChange={(e) => setProfileData({ ...profileData, current_weight_kg: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                      step="0.1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Target Weight (kg)</label>
                  <input
                    type="number"
                    value={profileData.target_weight_kg}
                    onChange={(e) => setProfileData({ ...profileData, target_weight_kg: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Fitness Goal</label>
                  <select
                    value={profileData.fitness_goal}
                    onChange={(e) => setProfileData({ ...profileData, fitness_goal: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="">Select goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="endurance">Endurance</option>
                    <option value="flexibility">Flexibility</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Experience Level</label>
                  <select
                    value={profileData.experience_level}
                    onChange={(e) => setProfileData({ ...profileData, experience_level: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Health Conditions</label>
                  <textarea
                    value={profileData.health_conditions}
                    onChange={(e) => setProfileData({ ...profileData, health_conditions: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    rows={2}
                    placeholder="Any health conditions or injuries..."
                  />
                </div>
                
                <div className="pt-4 border-t border-border mt-2">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Membership Dates (Admin Only)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Start Date</label>
                      <input
                        type="date"
                        value={profileData.membership_start_date}
                        onChange={(e) => setProfileData({ ...profileData, membership_start_date: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">End Date</label>
                      <input
                        type="date"
                        value={profileData.membership_end_date}
                        onChange={(e) => setProfileData({ ...profileData, membership_end_date: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpdateProfile}
                  disabled={isPending}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Update Profile'}
                </button>
              </div>
            </div>
          )}

          {/* Recent Progress */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Progress
            </h3>
            {recentProgress.length > 0 ? (
              <div className="space-y-2">
                {recentProgress.slice(0, 4).map((log: any) => (
                  <div key={log.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-lg text-sm">
                    <span className="text-muted-foreground">
                      {new Date(log.logged_at).toLocaleDateString()}
                    </span>
                    <span className="font-medium">{log.weight_kg} kg</span>
                    {log.bmi && <span className="text-muted-foreground">BMI: {log.bmi}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No progress records</p>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modals */}
      {modalType === 'trainer' && (
        <AssignmentModal
          isOpen={true}
          onClose={() => setModalType(null)}
          type="trainer"
          memberId={memberId}
          memberName={memberName}
          availableItems={availableTrainers}
          currentAssignment={trainerAssignments[0] ? {
            id: trainerAssignments[0].users?.id,
            name: `${trainerAssignments[0].users?.first_name} ${trainerAssignments[0].users?.last_name}`
          } : null}
        />
      )}
      {modalType === 'workout' && (
        <AssignmentModal
          isOpen={true}
          onClose={() => setModalType(null)}
          type="workout"
          memberId={memberId}
          memberName={memberName}
          availableItems={availableWorkouts}
          currentAssignment={activeWorkout ? {
            id: activeWorkout.workout_plans?.id,
            name: activeWorkout.workout_plans?.name
          } : null}
        />
      )}
      {modalType === 'diet' && (
        <AssignmentModal
          isOpen={true}
          onClose={() => setModalType(null)}
          type="diet"
          memberId={memberId}
          memberName={memberName}
          availableItems={availableDiets}
          currentAssignment={activeDiet ? {
            id: activeDiet.diet_plans?.id,
            name: activeDiet.diet_plans?.name
          } : null}
        />
      )}
    </>
  );
}
