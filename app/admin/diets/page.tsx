import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { Plus, Utensils, Users, Flame, Apple, Beef } from 'lucide-react';
import Link from 'next/link';
import { PlanActionsMenu } from '@/components/plan-actions-menu';
import { URLSearchInput } from '@/components/url-search-input';

export const dynamic = 'force-dynamic';

const DIET_IMAGES = [
  "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
  "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80",
];

const DIET_PREF_CONFIG = {
  veg: { color: 'from-emerald-500 to-green-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30', icon: Apple, label: 'Vegetarian' },
  non_veg: { color: 'from-rose-500 to-red-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-400/30', icon: Beef, label: 'Non-Veg' },
  custom: { color: 'from-amber-500 to-orange-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30', icon: Utensils, label: 'Custom' },
} as const;

export default async function DietPlansPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const user = await getCurrentUserData();
  if (!user?.gym_id) return null;

  let query = supabaseAdmin
    .from('diet_plans')
    .select('*, users(first_name, last_name)')
    .eq('gym_id', user.gym_id);

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data: plans } = await query.order('created_at', { ascending: false });

  const vegPlans = plans?.filter(p => p.diet_preference === 'veg') || [];
  const nonVegPlans = plans?.filter(p => p.diet_preference === 'non_veg') || [];
  const customPlans = plans?.filter(p => p.diet_preference !== 'veg' && p.diet_preference !== 'non_veg') || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom duration-500">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Diet Plans</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage nutrition programs</p>
        </div>
        <Link
          href="/admin/diets/new"
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Create Diet</span>
        </Link>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-100 fill-mode-both">
        <div className="mb-6 max-w-md">
          <URLSearchInput placeholder="Search diet plans..." />
        </div>
      </div>

      {!plans || plans.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground bg-card border border-border rounded-2xl animate-in fade-in duration-500">
          <Utensils className="w-16 h-16 mx-auto mb-4 opacity-15" />
          <p className="text-lg font-medium">{q ? `No results for "${q}"` : 'No diet plans yet'}</p>
          <p className="text-sm mt-1">Create your first diet plan to get started!</p>
        </div>
      ) : (
        <div className="space-y-10">
          {vegPlans.length > 0 && (
            <DietSection
              title="Vegetarian Plans"
              dotColor="bg-emerald-500"
              dotGlow="shadow-[0_0_10px_rgba(16,185,129,0.4)]"
              plans={vegPlans}
              baseIndex={0}
            />
          )}
          {nonVegPlans.length > 0 && (
            <DietSection
              title="Non-Vegetarian Plans"
              dotColor="bg-rose-500"
              dotGlow="shadow-[0_0_10px_rgba(244,63,94,0.4)]"
              plans={nonVegPlans}
              baseIndex={vegPlans.length}
            />
          )}
          {customPlans.length > 0 && (
            <DietSection
              title="Custom Plans"
              dotColor="bg-amber-500"
              dotGlow="shadow-[0_0_10px_rgba(245,158,11,0.4)]"
              plans={customPlans}
              baseIndex={vegPlans.length + nonVegPlans.length}
            />
          )}
        </div>
      )}
    </div>
  );
}

function DietSection({ title, dotColor, dotGlow, plans, baseIndex }: { title: string; dotColor: string; dotGlow: string; plans: any[]; baseIndex: number }) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both">
      <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2.5 text-foreground">
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor} ${dotGlow}`} />
        {title}
        <span className="text-sm font-normal text-muted-foreground">({plans.length})</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {plans.map((plan, i) => <DietPlanCard key={plan.id} plan={plan} index={baseIndex + i} delay={i} />)}
      </div>
    </section>
  );
}

function DietPlanCard({ plan, index, delay }: { plan: any; index: number; delay: number }) {
  const pref = (plan.diet_preference as keyof typeof DIET_PREF_CONFIG) || 'custom';
  const config = DIET_PREF_CONFIG[pref] || DIET_PREF_CONFIG.custom;
  const IconComponent = config.icon;

  return (
    <div 
      className="group relative h-[300px] sm:h-72 rounded-2xl overflow-hidden bg-zinc-900 animate-in fade-in slide-in-from-bottom duration-500 fill-mode-both"
      style={{ animationDelay: `${Math.min(delay * 80, 400)}ms` }}
    >
      {/* Clickable Overlay */}
      <Link href={`/admin/diets/${plan.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View Details</span>
      </Link>

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={DIET_IMAGES[index % DIET_IMAGES.length]} 
          alt={plan.name}
          className="w-full h-full object-cover transition-all duration-700 ease-out opacity-50 group-hover:opacity-80 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 transition-opacity duration-500 group-hover:via-black/40" />
      </div>

      {/* Animated Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.color} opacity-80 z-20 transition-all duration-500 group-hover:h-1.5 group-hover:opacity-100`} />

      {/* Top Right Actions */}
      <div className="absolute top-3 right-3 z-20">
        <div className="bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-lg p-1 transition-all duration-200 border border-white/10 hover:border-white/20">
          <PlanActionsMenu 
            planId={plan.id} 
            planType="diet" 
            planName={plan.name}
          />
        </div>
      </div>

      {/* Top Left Badge */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        {plan.diet_preference && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${config.badge} transition-all duration-300 group-hover:scale-105`}>
            <IconComponent className="w-3 h-3" />
            {plan.diet_preference.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-5 pb-5 pt-16 sm:px-6 sm:pb-6 pointer-events-none">
        {plan.total_calories && (
          <div className="mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary tracking-wide uppercase">
              <Flame className="w-3 h-3" />
              {plan.total_calories} Calories
            </span>
          </div>
        )}
        
        <h3 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight mb-1 drop-shadow-lg transition-colors duration-300 group-hover:text-primary line-clamp-1">
          {plan.name}
        </h3>
        
        <p className="text-xs sm:text-sm text-gray-300/90 line-clamp-1 mb-3 font-medium">
          {plan.description || 'Nutritious meal plan designed for your goals.'}
        </p>

        <div className="flex items-center gap-3 border-t border-white/15 pt-3 mt-auto">
          <div className="flex gap-3 text-[10px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wide">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              By {plan.users?.first_name || 'Admin'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
