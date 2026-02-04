import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { Users, Plus, Search, MoreVertical, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { UserActionsMenu } from '@/components/user-actions-menu';
import { ResendInviteButton, InvitePendingBadge } from '@/components/resend-invite-button';
import { URLSearchInput } from '@/components/url-search-input';

export const dynamic = 'force-dynamic';

// Helper to check if user has claimed their account
const isPendingInvite = (clerkId: string) => clerkId?.startsWith('invite_');

export default async function AdminMembersPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const user = await getCurrentUserData();
  
  if (!user?.gym_id) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Account Setup Required</h2>
        <p className="text-muted-foreground max-w-md">
          Your admin account is not associated with any gym. Please contact the superuser to assign a gym to your account.
        </p>
      </div>
    );
  }

  let query = supabaseAdmin
    .from('users')
    .select('*, user_profiles(*)')
    .eq('role', 'user')
    .eq('gym_id', user.gym_id);

  if (q) {
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: members } = await query.order('created_at', { ascending: false });

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Members</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage gym members</p>
        </div>
        <Link
          href="/admin/members/new"
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 touch-manipulation"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Add Member</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
        <URLSearchInput placeholder="Search members..." />
      </div>

      {/* Members List */}
      <div className="bg-card border border-border rounded-xl shadow-sm pb-20">
        
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-border">
          {!members || members.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground">
               <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
               <p className="text-sm sm:text-base">No members found. Add your first member!</p>
             </div>
          ) : (
            members.map((member) => {
              const pending = isPendingInvite(member.clerk_id);
              return (
                <div key={member.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <Link 
                        href={`/admin/members/${member.id}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        pending ? 'bg-amber-500' : 'bg-blue-500'
                      }`}>
                        {member.first_name?.[0] || member.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                           ID: {member.id.slice(0, 8)}...
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-1">
                      {pending && (
                         <ResendInviteButton
                            email={member.email}
                            role="user"
                            firstName={member.first_name || ''}
                            lastName={member.last_name || ''}
                            variant="icon"
                            isPending={pending}
                          />
                      )}
                      <UserActionsMenu
                        userId={member.id}
                        userRole="user"
                        isActive={member.is_active}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col text-muted-foreground">
                       <span className="truncate">{member.email}</span>
                       <span>{member.phone || 'No phone'}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       {member.user_profiles?.[0]?.fitness_goal && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary-dark">
                             <Dumbbell className="w-3 h-3" />
                             <span className="truncate max-w-[80px]">{member.user_profiles[0].fitness_goal}</span>
                          </span>
                       )}
                       <div className="flex gap-1 items-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            member.is_active 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {member.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {pending && <InvitePendingBadge />}
                       </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[640px]">
             <thead>
              <tr className="bg-muted/50 border-b border-border text-left">
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-muted-foreground">Name</th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-muted-foreground">Contact</th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-muted-foreground">Goal</th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-muted-foreground">Status</th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!members || members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm sm:text-base">No members found. Add your first member!</p>
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const pending = isPendingInvite(member.clerk_id);
                  
                  return (
                  <tr key={member.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <Link 
                        href={`/admin/members/${member.id}`}
                        className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-base flex-shrink-0 ${
                          pending ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {member.first_name?.[0] || member.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm sm:text-base truncate hover:text-primary">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Click to manage
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{member.email}</span>
                        <span className="text-xs">{member.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-muted-foreground">
                     {member.user_profiles?.[0]?.fitness_goal ? (
                        <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary-dark">
                          <Dumbbell className="w-3 h-3" />
                          <span className="hidden sm:inline">{member.user_profiles[0].fitness_goal}</span>
                          <span className="sm:hidden">{member.user_profiles[0].fitness_goal.slice(0, 10)}...</span>
                        </span>
                     ) : (
                       <span className="text-xs italic text-muted-foreground">Not set</span>
                     )}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.is_active 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {pending && <InvitePendingBadge />}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {pending && (
                          <ResendInviteButton
                            email={member.email}
                            role="user"
                            firstName={member.first_name || ''}
                            lastName={member.last_name || ''}
                            variant="icon"
                            isPending={pending}
                          />
                        )}
                        <UserActionsMenu
                          userId={member.id}
                          userRole="user"
                          isActive={member.is_active}
                        />
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
