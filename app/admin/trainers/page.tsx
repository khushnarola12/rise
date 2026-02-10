import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { Users, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { UserActionsMenu } from '@/components/user-actions-menu';
import { ResendInviteButton, InvitePendingBadge } from '@/components/resend-invite-button';
import { URLSearchInput } from '@/components/url-search-input';

// Helper to check if user has claimed their account (no auth_id linked yet)
const isPendingInvite = (clerkId?: string, authId?: string | null) => !authId && clerkId?.startsWith('invite_');
export default async function AdminTrainersPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
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
        <div className="text-xs text-muted-foreground font-mono mt-4">
          Error: MISSING_GYM_ID
        </div>
      </div>
    );
  }

  let query = supabaseAdmin
    .from('users')
    .select('*')
    .eq('role', 'trainer')
    .eq('gym_id', user.gym_id);

  if (q) {
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: trainers } = await query.order('created_at', { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trainers</h1>
          <p className="text-muted-foreground">Manage your gym's trainers</p>
        </div>
        <Link
          href="/admin/trainers/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Trainer
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <URLSearchInput placeholder="Search trainers..." />
      </div>

      {/* Trainers List */}
      <div className="bg-card border border-border rounded-xl shadow-sm pb-20">
        
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-border">
          {!trainers || trainers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No trainers found</p>
            </div>
          ) : (
            trainers.map((trainer) => {
              const pending = isPendingInvite(trainer.clerk_id, trainer.auth_id);
              return (
                <div key={trainer.id} className="p-4 space-y-3">
                  {/* Header: Info + Actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        pending ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
                      }`}>
                        {trainer.first_name?.[0] || trainer.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {trainer.first_name} {trainer.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">ID: {trainer.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {pending && (
                        <ResendInviteButton
                          email={trainer.email}
                          role="trainer"
                          firstName={trainer.first_name || ''}
                          lastName={trainer.last_name || ''}
                          variant="icon"
                          isPending={pending}
                        />
                      )}
                      <UserActionsMenu 
                        userId={trainer.id}
                        userRole="trainer"
                        isActive={trainer.is_active}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col text-muted-foreground">
                      <span className="truncate">{trainer.email}</span>
                      <span>{trainer.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <div className="flex flex-col gap-1 items-end">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trainer.is_active 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {trainer.is_active ? 'Active' : 'Inactive'}
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
          <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-left">
              <th className="px-6 py-4 font-medium text-muted-foreground">Name</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Contact</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Joined</th>
              <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!trainers || trainers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No trainers found</p>
                </td>
              </tr>
            ) : (
              trainers.map((trainer) => {
                const pending = isPendingInvite(trainer.clerk_id, trainer.auth_id);
                
                return (
                <tr key={trainer.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        pending ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
                      }`}>
                        {trainer.first_name?.[0] || trainer.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {trainer.first_name} {trainer.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">ID: {trainer.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{trainer.email}</span>
                      <span className="text-sm">{trainer.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trainer.is_active 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {trainer.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {pending && <InvitePendingBadge />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(trainer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {pending && (
                        <ResendInviteButton
                          email={trainer.email}
                          role="trainer"
                          firstName={trainer.first_name || ''}
                          lastName={trainer.last_name || ''}
                          variant="icon"
                          isPending={pending}
                        />
                      )}
                      <UserActionsMenu 
                        userId={trainer.id}
                        userRole="trainer"
                        isActive={trainer.is_active}
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
