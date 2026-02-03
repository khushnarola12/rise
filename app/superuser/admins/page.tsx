import { supabaseAdmin } from '@/lib/supabase-admin';
import { UserCog, Plus, Building2, Mail } from 'lucide-react';
import { URLSearchInput } from '@/components/url-search-input';
import Link from 'next/link';
import { ResendInviteButton, InvitePendingBadge } from '@/components/resend-invite-button';
import { UserActionsMenu } from '@/components/user-actions-menu';

export default async function AdminsPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
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

  // Helper to check if user has claimed their account
  const isPendingInvite = (clerkId: string) => clerkId?.startsWith('invite_');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administrators</h1>
          <p className="text-muted-foreground">Manage gym administrators and their gyms</p>
        </div>
        <Link
          href="/superuser/admins/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Admin
        </Link>
      </div>

      <div className="mb-6 max-w-md">
        <URLSearchInput placeholder="Search admins..." />
      </div>

      {/* Admins List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-left">
              <th className="px-6 py-4 font-medium text-muted-foreground">Name</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Gym</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Contact</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Joined</th>
              <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!admins || admins.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  <UserCog className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No administrators found</p>
                </td>
              </tr>
            ) : (
              admins.map((admin) => {
                const pending = isPendingInvite(admin.clerk_id);
                
                return (
                  <tr key={admin.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          pending ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
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
                          <span className="text-foreground font-medium">{admin.gyms.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">No gym assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex flex-col">
                        <span>{admin.email}</span>
                        <span className="text-sm">{admin.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.is_active 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {pending && <InvitePendingBadge />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
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
  );
}
