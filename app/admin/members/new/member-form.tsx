'use client';

import { useActionState } from 'react';
import { Users, ArrowLeft, Loader2, Save, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { createUser } from '@/app/actions/users';

const initialState = {
  message: '',
  error: '',
};

type Plan = {
  id: string;
  name: string;
  price: number;
  duration_days: number;
};

export default function MemberForm({ plans }: { plans: Plan[] }) {
  const [state, action, isPending] = useActionState(createUser, initialState);

  return (
    <div className="bg-card border border-border rounded-xl p-8 max-w-2xl">
      <form action={action} className="space-y-6">
        <input type="hidden" name="role" value="user" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-blue-500" />
          </div>
          <p className="text-sm text-muted-foreground">Member Details</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">First Name</label>
            <input
              required
              type="text"
              name="firstName"
              placeholder="Jane"
              className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"

            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Last Name</label>
            <input
              required
              type="text"
              name="lastName"
              placeholder="Smith"
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
            placeholder="jane.smith@example.com"
            className="w-full p-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="+1 (555) 000-0000"
            className="w-full p-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Membership Plan Selection */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Membership Plan
          </h3>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Plan</label>
            <select
              name="planId"
              className="w-full p-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              defaultValue=""
            >
              <option value="" disabled>Select a membership plan...</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price} / {plan.duration_days} days
                </option>
              ))}
            </select>
          </div>
        </div>

        {state?.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
            {state.error}
          </div>
        )}

        <div className="pt-4 flex gap-4">
           <Link
            href="/admin/members"
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
                Add Member
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
