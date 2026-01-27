import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Building2, Save } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function GymProfilePage() {
  const user = await getCurrentUserData();
  
  // Fetch gym details
  const { data: gym } = await supabaseAdmin
    .from('gyms')
    .select('*')
    .single();

  if (!gym) {
    return notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gym Profile</h1>
          <p className="text-muted-foreground">Manage your gym's public information</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 max-w-2xl">
        <form className="space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-12 h-12 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Gym Logo</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Gym Name</label>
            <input
              type="text"
              name="name"
              defaultValue={gym.name}
              className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"

            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Address</label>
            <textarea
              name="address"
              defaultValue={gym.address || ''}
              rows={3}
              className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"

            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <input
                type="tel"
                name="phone"
                defaultValue={gym.phone || ''}
                className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"

              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={gym.email || ''}
                className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"

              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              name="description"
              defaultValue={gym.description || ''}
              rows={4}
              className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"

            />
          </div>

          <div className="pt-4">
            <button
              type="button" 
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
