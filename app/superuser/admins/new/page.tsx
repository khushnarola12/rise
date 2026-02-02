'use client';

import { useActionState } from 'react';
import { UserCog, ArrowLeft, Loader2, Save, Building2, Mail } from 'lucide-react';
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
          <p className="text-muted-foreground">Create a new administrator with their gym</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 max-w-3xl">
        <form action={action} className="space-y-8">
          {/* Admin Details Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCog className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Admin Details</h2>
                <p className="text-sm text-muted-foreground">Personal information of the gym owner</p>
              </div>
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

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="john.doe@example.com"
                  className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  An invitation email with sign-in link will be sent automatically.
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
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Gym Profile Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Gym Profile</h2>
                <p className="text-sm text-muted-foreground">Details of the gym this admin will manage</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Gym Name *</label>
                <input
                  required
                  type="text"
                  name="gymName"
                  placeholder="Rise Fitness Center"
                  className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Address</label>
                <textarea
                  name="gymAddress"
                  placeholder="123 Fitness Street, Gym City, GC 12345"
                  rows={2}
                  className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Gym Phone</label>
                  <input
                    type="tel"
                    name="gymPhone"
                    placeholder="+1 (555) 123-4567"
                    className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Gym Email</label>
                  <input
                    type="email"
                    name="gymEmail"
                    placeholder="contact@risefitness.com"
                    className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  name="gymDescription"
                  placeholder="Premium fitness center with state-of-the-art equipment..."
                  rows={3}
                  className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
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
                  <Mail className="w-5 h-5" />
                  Create Admin & Send Invite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
