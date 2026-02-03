import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { notFound } from 'next/navigation';
import { User, Mail, Phone, Calendar, Scale, Activity, Target, TrendingUp, Dumbbell, Utensils, ClipboardList, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GradientStatCard } from '@/components/stat-card';
import { TrainerMemberActions } from './client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrainerMemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const trainer = await getCurrentUserData();

  if (!trainer) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Member</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to load member details. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Verify this member is assigned to the trainer
  const { data: assignment } = await supabaseAdmin
    .from('trainer_assignments')
    .select('*')
    .eq('trainer_id', trainer.id)
    .eq('user_id', id)
    .eq('is_active', true)
    .single();

  if (!assignment) {
    notFound();
  }

  // Fetch member details
  const { data: member } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (!member) {
    notFound();
  }

  // Fetch member profile
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('user_id', id)
    .single();

  // Fetch active workout and diet plans
  const [
    { data: activeWorkout },
    { data: activeDiet },
    { data: recentAttendance },
    { data: recentProgress },
    { data: availableWorkouts },
    { data: availableDiets }
  ] = await Promise.all([
    supabaseAdmin
      .from('user_workout_plans')
      .select('*, workout_plans(*)')
      .eq('user_id', id)
      .eq('is_active', true)
      .single(),
    supabaseAdmin
      .from('user_diet_plans')
      .select('*, diet_plans(*)')
      .eq('user_id', id)
      .eq('is_active', true)
      .single(),
    supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('user_id', id)
      .order('date', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('progress_logs')
      .select('*')
      .eq('user_id', id)
      .order('logged_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('workout_plans')
      .select('id, name, description, difficulty, duration_weeks')
      .eq('gym_id', trainer.gym_id),
    supabaseAdmin
      .from('diet_plans')
      .select('id, name, description, diet_preference, total_calories')
      .eq('gym_id', trainer.gym_id),
  ]);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Back Button & Header */}
      <div>
        <Link
          href="/trainer/members"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.first_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {member.first_name} {member.last_name}
              </h1>
              <p className="text-muted-foreground">{member.email}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            member.is_active 
              ? 'bg-green-500/10 text-green-500' 
              : 'bg-red-500/10 text-red-500'
          }`}>
            {member.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GradientStatCard
            title="Weight"
            value={profile.current_weight_kg ? `${profile.current_weight_kg} kg` : 'N/A'}
            icon={Scale}
            gradient="gradient-primary"
          />
          <GradientStatCard
            title="BMI"
            value={profile.bmi || 'N/A'}
            icon={Activity}
            gradient="gradient-secondary"
          />
          <GradientStatCard
            title="Height"
            value={profile.height_cm ? `${profile.height_cm} cm` : 'N/A'}
            icon={TrendingUp}
            gradient="gradient-accent"
          />
          <GradientStatCard
            title="Target"
            value={profile.target_weight_kg ? `${profile.target_weight_kg} kg` : 'N/A'}
            icon={Target}
            gradient="gradient-success"
          />
        </div>
      )}

      {/* Quick Actions for Trainer */}
      <TrainerMemberActions
        memberId={id}
        memberName={`${member.first_name} ${member.last_name}`}
        profile={profile}
        activeWorkout={activeWorkout}
        activeDiet={activeDiet}
        availableWorkouts={availableWorkouts || []}
        availableDiets={availableDiets || []}
        recentProgress={recentProgress || []}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{member.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{member.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">
                Member since {new Date(member.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Fitness Profile */}
        {profile && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Fitness Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fitness Goal</p>
                <p className="font-medium text-foreground capitalize">
                  {profile.fitness_goal?.replace('_', ' ') || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-medium text-foreground capitalize">
                  {profile.experience_level || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium text-foreground">{profile.age || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Health Conditions</p>
                <p className="font-medium text-foreground">{profile.health_conditions || 'None'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Plan */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Active Workout Plan</h3>
          </div>
          
          {activeWorkout ? (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="font-medium text-foreground mb-1">
                {activeWorkout.workout_plans?.name}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                {activeWorkout.workout_plans?.description}
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs capitalize">
                  {activeWorkout.workout_plans?.difficulty}
                </span>
                <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                  {activeWorkout.workout_plans?.duration_weeks} weeks
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No active workout plan</p>
            </div>
          )}
        </div>

        {/* Diet Plan */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Active Diet Plan</h3>
          </div>
          
          {activeDiet ? (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="font-medium text-foreground mb-1">
                {activeDiet.diet_plans?.name}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                {activeDiet.diet_plans?.description}
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs capitalize">
                  {activeDiet.diet_plans?.diet_preference?.replace('_', ' ')}
                </span>
                <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                  {activeDiet.diet_plans?.total_calories} kcal
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Utensils className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No active diet plan</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Recent Attendance</h3>
          </div>
          
          {recentAttendance && recentAttendance.length > 0 ? (
            <div className="space-y-2">
              {recentAttendance.map((record: any) => (
                <div key={record.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-foreground">
                    {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  {record.check_in_time && (
                    <span className="text-sm text-muted-foreground">
                      {new Date(record.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">No recent attendance</p>
          )}
        </div>

        {/* Recent Progress */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Recent Progress</h3>
          </div>
          
          {recentProgress && recentProgress.length > 0 ? (
            <div className="space-y-2">
              {recentProgress.map((log: any) => (
                <div key={log.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-foreground">
                    {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex gap-3 text-sm">
                    <span className="text-foreground">{log.weight_kg} kg</span>
                    {log.bmi && <span className="text-muted-foreground">BMI: {log.bmi}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">No progress records</p>
          )}
        </div>
      </div>
    </div>
  );
}
