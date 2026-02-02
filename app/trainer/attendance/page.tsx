import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ClipboardList, Calendar, Clock, CheckCircle, Users, Search } from 'lucide-react';
import { GradientStatCard } from '@/components/stat-card';

export default async function TrainerAttendancePage() {
  const user = await getCurrentUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <ClipboardList className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Attendance</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to load attendance records. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const { data: assignments } = await supabaseAdmin
    .from('trainer_assignments')
    .select('user_id')
    .eq('trainer_id', user.id)
    .eq('is_active', true);

  const memberIds = assignments?.map(a => a.user_id) || [];

  const { data: attendance } = memberIds.length > 0 ? await supabaseAdmin
    .from('attendance')
    .select(`*, users:user_id (first_name, last_name, email)`)
    .in('user_id', memberIds)
    .order('date', { ascending: false })
    .limit(50) : { data: [] };

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const todayAttendance = attendance?.filter(a => a.date === today) || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Member Attendance</h1>
        <p className="text-muted-foreground">Track gym visits of your assigned members</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientStatCard title="Total Members" value={memberIds.length} icon={Users} gradient="gradient-primary" />
        <GradientStatCard title="Present Today" value={todayAttendance.length} icon={CheckCircle} gradient="gradient-success" />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Today's Check-ins</h2>
        {todayAttendance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayAttendance.map((record: any) => (
              <div key={record.id} className="flex items-center gap-4 p-4 bg-green-500/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">{record.users?.first_name} {record.users?.last_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {record.check_in_time && new Date(record.check_in_time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">No check-ins today</p>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Recent History</h2>
        {attendance && attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-muted-foreground">Member</th>
                  <th className="pb-3 text-muted-foreground">Date</th>
                  <th className="pb-3 text-muted-foreground">Check In</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record: any) => (
                  <tr key={record.id} className="border-b border-border/50">
                    <td className="py-3 font-medium">{record.users?.first_name} {record.users?.last_name}</td>
                    <td className="py-3">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="py-3">{record.check_in_time && new Date(record.check_in_time).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">No attendance records</p>
        )}
      </div>
    </div>
  );
}
