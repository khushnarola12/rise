import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { TrendingUp, Scale, Activity, Target, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { GradientStatCard } from '@/components/stat-card';

export default async function UserProgressPage() {
  const user = await getCurrentUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Progress</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to load your progress records. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Fetch progress logs
  const { data: progressLogs, error } = await supabaseAdmin
    .from('progress_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false });

  // Fetch user profile for goals
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Calculate progress
  const latestLog = progressLogs?.[0];
  const firstLog = progressLogs?.[progressLogs.length - 1];
  
  const weightChange = latestLog && firstLog ? 
    (latestLog.weight_kg - firstLog.weight_kg).toFixed(1) : null;
  
  const bmiChange = latestLog && firstLog && latestLog.bmi && firstLog.bmi ? 
    (latestLog.bmi - firstLog.bmi).toFixed(1) : null;

  const targetWeight = profile?.target_weight_kg;
  const currentWeight = latestLog?.weight_kg;
  const weightToGoal = targetWeight && currentWeight ? 
    (currentWeight - targetWeight).toFixed(1) : null;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          My Progress
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
          Track your fitness journey and see how far you've come
        </p>
      </div>

      {/* Current Stats */}
      {latestLog ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GradientStatCard
              title="Current Weight"
              value={`${latestLog.weight_kg} kg`}
              icon={Scale}
              gradient="gradient-primary"
            />
            <GradientStatCard
              title="Current BMI"
              value={latestLog.bmi || 'N/A'}
              icon={Activity}
              gradient="gradient-secondary"
            />
            {latestLog.body_fat_percentage && (
              <GradientStatCard
                title="Body Fat"
                value={`${latestLog.body_fat_percentage}%`}
                icon={Target}
                gradient="gradient-accent"
              />
            )}
            {latestLog.muscle_mass_kg && (
              <GradientStatCard
                title="Muscle Mass"
                value={`${latestLog.muscle_mass_kg} kg`}
                icon={TrendingUp}
                gradient="gradient-success"
              />
            )}
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Progress */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Weight Progress
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">Starting Weight</span>
                  <span className="font-semibold text-foreground">{firstLog?.weight_kg} kg</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">Current Weight</span>
                  <span className="font-semibold text-foreground">{latestLog.weight_kg} kg</span>
                </div>
                {targetWeight && (
                  <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Target Weight</span>
                    <span className="font-semibold text-foreground">{targetWeight} kg</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                  <span className="text-muted-foreground">Total Change</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    parseFloat(weightChange || '0') < 0 ? 'text-green-500' : 
                    parseFloat(weightChange || '0') > 0 ? 'text-red-500' : 'text-foreground'
                  }`}>
                    {parseFloat(weightChange || '0') < 0 ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : parseFloat(weightChange || '0') > 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                    {Math.abs(parseFloat(weightChange || '0'))} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Goal Progress */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Goal Progress
              </h3>
              
              {targetWeight && currentWeight ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-foreground mb-2">
                      {Math.abs(parseFloat(weightToGoal || '0'))} kg
                    </div>
                    <p className="text-muted-foreground">
                      {parseFloat(weightToGoal || '0') > 0 ? 'to lose' : 
                       parseFloat(weightToGoal || '0') < 0 ? 'to gain' : 'Goal reached! 🎉'}
                    </p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Start: {firstLog?.weight_kg} kg</span>
                      <span>Goal: {targetWeight} kg</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, Math.max(0, 
                            ((firstLog?.weight_kg - currentWeight) / (firstLog?.weight_kg - targetWeight)) * 100
                          ))}%` 
                        }}
                      />
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      {Math.round(Math.min(100, Math.max(0, 
                        ((firstLog?.weight_kg - currentWeight) / (firstLog?.weight_kg - targetWeight)) * 100
                      )))}% towards goal
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No target weight set</p>
                  <p className="text-sm mt-1">Contact your trainer to set goals</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress History */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Progress History
            </h3>
            
            {progressLogs && progressLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Date</th>
                      <th className="pb-3 font-medium text-muted-foreground">Weight</th>
                      <th className="pb-3 font-medium text-muted-foreground">BMI</th>
                      <th className="pb-3 font-medium text-muted-foreground">Body Fat</th>
                      <th className="pb-3 font-medium text-muted-foreground">Muscle</th>
                      <th className="pb-3 font-medium text-muted-foreground">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressLogs.map((log: any, index: number) => {
                      const prevLog = progressLogs[index + 1];
                      const weightDiff = prevLog ? log.weight_kg - prevLog.weight_kg : 0;
                      
                      return (
                        <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 text-foreground">
                            {new Date(log.logged_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3">
                            <span className="font-medium text-foreground">{log.weight_kg} kg</span>
                            {weightDiff !== 0 && (
                              <span className={`ml-2 text-xs ${
                                weightDiff < 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                ({weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)})
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-foreground">{log.bmi || '-'}</td>
                          <td className="py-3 text-foreground">
                            {log.body_fat_percentage ? `${log.body_fat_percentage}%` : '-'}
                          </td>
                          <td className="py-3 text-foreground">
                            {log.muscle_mass_kg ? `${log.muscle_mass_kg} kg` : '-'}
                          </td>
                          <td className="py-3 text-muted-foreground text-sm">
                            {log.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No progress records yet</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Progress Data Yet
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your progress will be tracked here once your trainer logs your measurements. 
            Regular check-ins help monitor your fitness journey!
          </p>
        </div>
      )}
    </div>
  );
}
