'use client';

import { useActionState } from 'react';
import { UserCog, ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { createAdmin } from '@/app/actions/admin';

const initialState = {
  message: '',
  error: '',
};

export default function NewAdminPage() {
  const [state, action, isPending] = useActionState(createAdmin, initialState);

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
          <h1 className="text-3xl font-bold text-foreground">Add New Admin</h1>
          <p className="text-muted-foreground">Create a new administrator account</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 max-w-2xl">
        <form action={action} className="space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserCog className="w-10 h-10 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Admin Details</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">First Name</label>
              <input
                required
                type="text"
                name="firstName"
                placeholder="John"
                className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"

              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <input
                required
                type="text"
                name="lastName"
                placeholder="Doe"
                className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"

              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <input
              required
              type="email"
              name="email"
              placeholder="john.doe@example.com"
              className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"

            />
            <p className="text-xs text-muted-foreground">
              User will need to sign up with this exact email to claim the account.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+1 (555) 000-0000"
              className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"

            />
          </div>

          {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
              {state.error}
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Admin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
