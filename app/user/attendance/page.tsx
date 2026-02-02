import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ClipboardList, Calendar, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { GradientStatCard } from '@/components/stat-card';

export default async function UserAttendancePage() {
  const user = await getCurrentUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <ClipboardList className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Attendance</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to load your attendance records. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Fetch attendance records
  const { data: attendance, error } = await supabaseAdmin
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(50);

  // Calculate stats
  const now = new Date();
  const thisMonth = attendance?.filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }) || [];

  const lastMonth = attendance?.filter(a => {
    const date = new Date(a.date);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
  }) || [];

  const thisWeek = attendance?.filter(a => {
    const date = new Date(a.date);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }) || [];

  const streak = calculateStreak(attendance || []);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          My Attendance
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
          Track your gym visits and maintain your streak
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientStatCard
          title="This Month"
          value={thisMonth.length}
          icon={Calendar}
          gradient="gradient-primary"
        />
        <GradientStatCard
          title="Last Month"
          value={lastMonth.length}
          icon={Calendar}
          gradient="gradient-secondary"
        />
        <GradientStatCard
          title="This Week"
          value={thisWeek.length}
          icon={TrendingUp}
          gradient="gradient-accent"
        />
        <GradientStatCard
          title="Current Streak"
          value={`${streak} days`}
          icon={CheckCircle}
          gradient="gradient-success"
        />
      </div>

      {/* Calendar View - Simple Monthly View */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
        
        {attendance && attendance.length > 0 ? (
          <div className="space-y-3">
            {attendance.map((record: any) => {
              const checkIn = record.check_in_time ? new Date(record.check_in_time) : null;
              const checkOut = record.check_out_time ? new Date(record.check_out_time) : null;
              const duration = checkIn && checkOut ? 
                Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60)) : null;

              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-green-500">
                        {new Date(record.date).getDate()}
                      </span>
                      <span className="text-xs text-green-500">
                        {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {checkIn && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            In: {checkIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {checkOut && (
                          <span className="flex items-center gap-1">
                            Out: {checkOut.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {duration ? (
                      <div>
                        <span className="text-lg font-semibold text-foreground">
                          {Math.floor(duration / 60)}h {duration % 60}m
                        </span>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs">
                        {record.check_out_time ? 'Recorded' : 'In Progress'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Attendance Records
            </h3>
            <p className="text-muted-foreground">
              Start visiting the gym to build your attendance history!
            </p>
          </div>
        )}
      </div>

      {/* Motivational Message */}
      {streak > 0 && (
        <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">🔥</div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            {streak} Day Streak!
          </h3>
          <p className="text-muted-foreground">
            {streak >= 7 
              ? "Amazing consistency! Keep up the great work!" 
              : "You're building momentum. Keep going!"}
          </p>
        </div>
      )}
    </div>
  );
}

function calculateStreak(attendance: any[]): number {
  if (!attendance || attendance.length === 0) return 0;

  // Sort by date descending
  const sorted = [...attendance].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const recordDate = new Date(sorted[i].date);
    recordDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - streak);
    
    // Allow for today or yesterday to start the streak
    if (i === 0) {
      const dayDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff > 1) break; // Streak is broken if last visit was more than 1 day ago
      streak = 1;
    } else {
      const prevDate = new Date(sorted[i - 1].date);
      prevDate.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((prevDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
  }

  return streak;
}
