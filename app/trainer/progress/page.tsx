import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { TrendingUp, Scale, Users, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { GradientStatCard } from '@/components/stat-card';
import Link from 'next/link';

export default async function TrainerProgressPage() {
  const user = await getCurrentUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Progress</h2>
        <p className="text-muted-foreground">Unable to load progress records.</p>
      </div>
    );
  }

  const { data: assignments } = await supabaseAdmin
    .from('trainer_assignments')
    .select('user_id, users:user_id (id, first_name, last_name, email)')
    .eq('trainer_id', user.id)
    .eq('is_active', true);

  const memberIds = assignments?.map(a => a.user_id) || [];

  const { data: progressLogs } = memberIds.length > 0 ? await supabaseAdmin
    .from('progress_logs')
    .select('*, users:user_id (first_name, last_name)')
    .in('user_id', memberIds)
    .order('logged_at', { ascending: false })
    .limit(30) : { data: [] };

  const { data: profiles } = memberIds.length > 0 ? await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .in('user_id', memberIds) : { data: [] };

  const membersWithGoals = profiles?.filter(p => p.target_weight_kg) || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Member Progress</h1>
        <p className="text-muted-foreground">Track fitness progress of your members</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientStatCard title="Total Members" value={memberIds.length} icon={Users} gradient="gradient-primary" />
        <GradientStatCard title="With Goals" value={membersWithGoals.length} icon={TrendingUp} gradient="gradient-success" />
        <GradientStatCard title="Recent Logs" value={progressLogs?.length || 0} icon={Scale} gradient="gradient-secondary" />
      </div>

      {/* Member Progress Overview */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Member Overview</h2>
        {assignments && assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment: any) => {
              const member = assignment.users;
              const profile = profiles?.find(p => p.user_id === member.id);
              const latestLog = progressLogs?.find(l => l.user_id === member.id);
              
              return (
                <Link
                  key={member.id}
                  href={`/trainer/members/${member.id}`}
                  className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">{member.first_name} {member.last_name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold">{latestLog?.weight_kg || profile?.current_weight_kg || '-'}</p>
                      <p className="text-xs text-muted-foreground">Weight</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{latestLog?.bmi || profile?.bmi || '-'}</p>
                      <p className="text-xs text-muted-foreground">BMI</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{profile?.target_weight_kg || '-'}</p>
                      <p className="text-xs text-muted-foreground">Target</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">No members assigned</p>
        )}
      </div>

      {/* Recent Progress Logs */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Progress Logs</h2>
        {progressLogs && progressLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-muted-foreground">Member</th>
                  <th className="pb-3 text-muted-foreground">Date</th>
                  <th className="pb-3 text-muted-foreground">Weight</th>
                  <th className="pb-3 text-muted-foreground">BMI</th>
                  <th className="pb-3 text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {progressLogs.map((log: any) => (
                  <tr key={log.id} className="border-b border-border/50">
                    <td className="py-3 font-medium">{log.users?.first_name} {log.users?.last_name}</td>
                    <td className="py-3">{new Date(log.logged_at).toLocaleDateString()}</td>
                    <td className="py-3">{log.weight_kg} kg</td>
                    <td className="py-3">{log.bmi || '-'}</td>
                    <td className="py-3 text-muted-foreground text-sm">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">No progress logs recorded</p>
        )}
      </div>
    </div>
  );
}
