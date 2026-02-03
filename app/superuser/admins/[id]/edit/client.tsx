'use client';

import { useState, useTransition } from 'react';
import { UserCog, ArrowLeft, Loader2, Save, Mail } from 'lucide-react';
import Link from 'next/link';
import { updateUser } from '@/app/actions/users';

export function EditAdminForm({ admin }: { admin: any }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = (formData: FormData) => {
    setError('');
    startTransition(async () => {
      try {
        await updateUser(admin.id, formData);
      } catch (e: any) {
        if (e.message === 'NEXT_REDIRECT') throw e;
        setError(e.message || 'Failed to update admin details');
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center gap-4">
        <Link 
          href="/superuser/admins"
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Admin</h1>
          <p className="text-muted-foreground">Update administrator details</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 max-w-3xl">
        <form action={handleSubmit} className="space-y-8">
          <input type="hidden" name="role" value="admin" />
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCog className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Admin Details</h2>
                <p className="text-sm text-muted-foreground">Personal information</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Name</label>
                <input
                  required
                  type="text"
                  name="firstName"
                  defaultValue={admin.first_name || ''}
                  className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <input
                  required
                  type="text"
                  name="lastName"
                  defaultValue={admin.last_name || ''}
                  className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input
                  disabled
                  type="email"
                  value={admin.email}
                  className="w-full p-3 bg-muted/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={admin.phone || ''}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <Link
              href="/superuser/admins"
              className="px-6 py-3 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit" 
              disabled={isPending}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
