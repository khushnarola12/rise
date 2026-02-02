import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Users, Search, Plus, Mail, Phone, Activity, Dumbbell, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function TrainerMembersPage() {
  const user = await getCurrentUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Members</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to load member list. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Fetch assigned members with profiles
  const { data: assignments, error } = await supabaseAdmin
    .from('trainer_assignments')
    .select(`
      *,
      users:user_id (
        id,
        first_name,
        last_name,
        email,
        phone,
        avatar_url,
        is_active
      )
    `)
    .eq('trainer_id', user.id)
    .eq('is_active', true);

  // Get member IDs for fetching additional data
  const memberIds = assignments?.map(a => a.user_id) || [];

  // Fetch profiles for members
  const { data: profiles } = memberIds.length > 0 ? await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .in('user_id', memberIds) : { data: [] };

  // Create a map of profiles
  const profileMap = profiles?.reduce((acc: any, p: any) => {
    acc[p.user_id] = p;
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            My Members
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your assigned members and their progress
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Members Grid */}
      {assignments && assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment: any) => {
            const member = assignment.users;
            const profile = profileMap[member.id];
            
            return (
              <Link
                key={assignment.id}
                href={`/trainer/members/${member.id}`}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.first_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {member.first_name?.[0] || member.email[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {member.first_name} {member.last_name}
                      </h3>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        member.is_active ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    {member.phone && (
                      <p className="text-sm text-muted-foreground">{member.phone}</p>
                    )}
                  </div>
                </div>

                {/* Profile Stats */}
                {profile && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {profile.current_weight_kg || '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">Weight (kg)</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {profile.bmi || '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">BMI</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground capitalize">
                        {profile.fitness_goal?.replace('_', ' ').slice(0, 8) || '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">Goal</p>
                    </div>
                  </div>
                )}

                {/* Assigned Date */}
                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Members Assigned
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You don't have any members assigned yet. Contact your gym admin to get members assigned to you.
          </p>
        </div>
      )}
    </div>
  );
}
