import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { User, Mail, Phone, Calendar, MapPin, Target, Activity, Scale } from 'lucide-react';
import { ProfileSettings } from './client';

// Ensure fresh data on every request after revalidation
export const dynamic = 'force-dynamic';

export default async function UserProfilePage() {
  const user = await getCurrentUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Profile</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to load your profile. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch gym details
  const { data: gym } = await supabaseAdmin
    .from('gyms')
    .select('name, address')
    .eq('id', user.gym_id)
    .single();

  // Fetch assigned trainer
  const { data: trainerAssignment } = await supabaseAdmin
    .from('trainer_assignments')
    .select(`
      *,
      users:trainer_id (
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          My Profile
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
          View your information and manage account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.first_name || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-4 space-y-2">
              <span className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                {user.is_active ? 'Active Member' : 'Inactive'}
              </span>
              {gym && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {gym.name}
                </p>
              )}
            </div>
          </div>

          {/* Trainer Info */}
          {trainerAssignment && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">My Trainer</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {trainerAssignment.users?.first_name} {trainerAssignment.users?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {trainerAssignment.users?.email}
                  </p>
                  {trainerAssignment.users?.phone && (
                    <p className="text-sm text-muted-foreground">
                      {trainerAssignment.users.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="font-medium text-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <p className="font-medium text-foreground">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Member Since</label>
                <p className="font-medium text-foreground">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Physical Profile */}
          {profile ? (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Physical Profile
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Scale className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {profile.current_weight_kg || '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">Weight (kg)</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Activity className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {profile.height_cm || '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">Height (cm)</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Target className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {profile.bmi || '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">BMI</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    {profile.age || '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">Age</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Fitness Goal</label>
                  <p className="font-medium text-foreground capitalize">
                    {profile.fitness_goal?.replace('_', ' ') || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Experience Level</label>
                  <p className="font-medium text-foreground capitalize">
                    {profile.experience_level || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Target Weight</label>
                  <p className="font-medium text-foreground">
                    {profile.target_weight_kg ? `${profile.target_weight_kg} kg` : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Health Conditions</label>
                  <p className="font-medium text-foreground">
                    {profile.health_conditions || 'None specified'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Profile Data Yet
                </h3>
                <p className="text-muted-foreground">
                  Your physical profile hasn't been set up yet. Contact your trainer to update your details.
                </p>
              </div>
            </div>
          )}

          {/* Settings Section (from settings page) */}
          <ProfileSettings user={user} />
        </div>
      </div>
    </div>
  );
}
