import { supabaseAdmin } from '@/lib/supabase-admin';
import { getRevenuePerAdmin } from '@/lib/settings';
import { UserCog, Plus, Building2 } from 'lucide-react';
import { URLSearchInput } from '@/components/url-search-input';
import Link from 'next/link';
import { ResendInviteButton, InvitePendingBadge } from '@/components/resend-invite-button';
import { UserActionsMenu } from '@/components/user-actions-menu';
import { RevenueCard } from '@/components/revenue-card';

export default async function AdminsPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  
  const [revenuePerAdmin] = await Promise.all([getRevenuePerAdmin()]);
  
  let query = supabaseAdmin
    .from('users')
    .select(`
      *,
      gyms:gym_id (
        id,
        name
      )
    `)
    .eq('role', 'admin');

  if (q) {
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: admins } = await query.order('created_at', { ascending: false });

  // Helper to check if user has claimed their account (no auth_id linked yet)
  const isPendingInvite = (clerkId?: string, authId?: string | null) => !authId && clerkId?.startsWith('invite_');
  
  // Count active admins for revenue calculation
  const totalAdmins = admins?.length || 0;
  const activeAdmins = admins?.filter(admin => admin.is_active).length || 0;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administrators</h1>
          <p className="text-muted-foreground mt-1">Manage gym administrators</p>
        </div>
        <Link
          href="/superuser/admins/new"
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Admin
        </Link>
      </div>

      {/* Revenue Card */}
      <RevenueCard 
        totalAdmins={totalAdmins}
        activeAdmins={activeAdmins}
        revenuePerAdmin={revenuePerAdmin} 
        editable={true}
      />

      {/* Search */}
      <div className="max-w-md">
        <URLSearchInput placeholder="Search admins..." />
      </div>

      {/* Admins List */}
      <div className="bg-card border border-border rounded-2xl pb-20">
        
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-border">
          {!admins || admins.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <UserCog className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No administrators found</p>
            </div>
          ) : (
            admins.map((admin) => {
              const pending = isPendingInvite(admin.clerk_id, admin.auth_id);
              return (
                <div key={admin.id} className="p-4 space-y-3">
                  {/* Top Row: User Info + Actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                        pending ? 'bg-amber-500' : 'bg-violet-500'
                      }`}>
                        {admin.first_name?.[0] || admin.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {admin.first_name} {admin.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {pending && (
                        <ResendInviteButton
                            email={admin.email}
                            role="admin"
                            firstName={admin.first_name || ''}
                            lastName={admin.last_name || ''}
                            variant="icon"
                            isPending={pending}
                          />
                      )}
                      <UserActionsMenu 
                        userId={admin.id}
                        userRole="admin"
                        isActive={admin.is_active}
                      />
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {/* Gym */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      <span className="truncate">{admin.gyms?.name || 'No gym'}</span>
                    </div>
                    {/* Status */}
                    <div className="flex items-center justify-end gap-2">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          admin.is_active 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-6 py-4 text-left font-medium text-muted-foreground">Admin</th>
              <th className="px-6 py-4 text-left font-medium text-muted-foreground">Gym</th>
              <th className="px-6 py-4 text-left font-medium text-muted-foreground">Contact</th>
              <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-left font-medium text-muted-foreground">Revenue</th>
              <th className="px-6 py-4 text-left font-medium text-muted-foreground">Joined</th>
              <th className="px-6 py-4 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!admins || admins.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                  <UserCog className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No administrators found</p>
                  <Link 
                    href="/superuser/admins/new"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Admin
                  </Link>
                </td>
              </tr>
            ) : (
              admins.map((admin) => {
                const pending = isPendingInvite(admin.clerk_id, admin.auth_id);
                
                return (
                  <tr key={admin.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                          pending ? 'bg-amber-500' : 'bg-violet-500'
                        }`}>
                          {admin.first_name?.[0] || admin.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {admin.first_name} {admin.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">ID: {admin.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {admin.gyms ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium text-foreground">{admin.gyms.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No gym</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      <div>{admin.email}</div>
                      <div>{admin.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium w-fit ${
                          admin.is_active 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {pending && <InvitePendingBadge />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-sm font-medium">
                        ${revenuePerAdmin.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {pending && (
                          <ResendInviteButton
                            email={admin.email}
                            role="admin"
                            firstName={admin.first_name || ''}
                            lastName={admin.last_name || ''}
                            variant="icon"
                            isPending={pending}
                          />
                        )}
                        <UserActionsMenu 
                          userId={admin.id}
                          userRole="admin"
                          isActive={admin.is_active}
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
