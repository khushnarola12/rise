import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { User, Mail, Phone, Calendar, ArrowLeft, Dumbbell, Utensils, UserCheck, Scale, Target, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import { GradientStatCard } from '@/components/stat-card';
import { MemberManagementClient } from './client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const admin = await getCurrentUserData();

  if (!admin || !['superuser', 'admin'].includes(admin.role)) {
    notFound();
  }

  // Fetch member details
  const { data: member } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('role', 'user')
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

  // Fetch current assignments
  const [
    { data: trainerAssignments },
    { data: activeWorkout },
    { data: activeDiet },
    { data: recentProgress },
    { data: recentAttendance },
    { data: activeMembership }
  ] = await Promise.all([
    supabaseAdmin
      .from('trainer_assignments')
      .select('*, users:trainer_id(id, first_name, last_name, email)')
      .eq('user_id', id)
      .eq('is_active', true),
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
      .from('progress_logs')
      .select('*')
      .eq('user_id', id)
      .order('logged_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('user_id', id)
      .order('date', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('user_memberships')
      .select('id, start_date, end_date')
      .eq('user_id', id)
      .eq('status', 'active')
      .order('end_date', { ascending: false })
      .limit(1)
      .single(),
  ]);


  // Fetch available trainers, workouts, and diets for assignment
  const [
    { data: availableTrainers },
    { data: availableWorkouts },
    { data: availableDiets }
  ] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('role', 'trainer')
      .eq('gym_id', admin.gym_id)
      .eq('is_active', true),
    supabaseAdmin
      .from('workout_plans')
      .select('id, name, description, difficulty, duration_weeks')
      .eq('gym_id', admin.gym_id),
    supabaseAdmin
      .from('diet_plans')
      .select('id, name, description, diet_preference, total_calories')
      .eq('gym_id', admin.gym_id),
  ]);

  // Calculate attendance stats
  const now = new Date();
  const thisMonth = recentAttendance?.filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom">
      {/* Back Button & Header */}
      <div>
        <Link
          href="/admin/members"
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GradientStatCard
          title="Weight"
          value={profile?.current_weight_kg ? `${profile.current_weight_kg} kg` : 'N/A'}
          icon={Scale}
          gradient="gradient-primary"
        />
        <GradientStatCard
          title="BMI"
          value={profile?.bmi || 'N/A'}
          icon={Activity}
          gradient="gradient-secondary"
        />
        <GradientStatCard
          title="Target"
          value={profile?.target_weight_kg ? `${profile.target_weight_kg} kg` : 'N/A'}
          icon={Target}
          gradient="gradient-accent"
        />
        <GradientStatCard
          title="This Month"
          value={`${thisMonth.length} visits`}
          icon={TrendingUp}
          gradient="gradient-success"
        />
      </div>

      {/* Member Management Client Component */}
      <MemberManagementClient
        memberId={id}
        memberName={`${member.first_name} ${member.last_name}`}
        profile={profile}
        activeMembership={activeMembership}
        trainerAssignments={trainerAssignments || []}
        activeWorkout={activeWorkout}
        activeDiet={activeDiet}
        availableTrainers={availableTrainers || []}
        availableWorkouts={availableWorkouts || []}
        availableDiets={availableDiets || []}
        recentProgress={recentProgress || []}
        recentAttendance={recentAttendance || []}
      />
    </div>
  );
}
