'use client';

import { useTransition } from 'react';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { updateUser } from '@/app/actions/users';

interface EditUserFormProps {
  user: any;
  role: 'trainer' | 'user';
}

export default function EditUserForm({ user, role }: EditUserFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateUser(user.id, formData);
      } catch (error) {
        alert('Failed to update user');
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="role" value={role} />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">First Name</label>
          <input
            required
            type="text"
            name="firstName"
            defaultValue={user.first_name}
            className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Last Name</label>
          <input
            required
            type="text"
            name="lastName"
            defaultValue={user.last_name}
            className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email Address</label>
        <input
          disabled
          type="email"
          value={user.email}
          className="w-full p-3 bg-muted/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Phone Number</label>
        <input
          type="tel"
          name="phone"
          defaultValue={user.phone || ''}
          placeholder="+1 (555) 000-0000"
          className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {role === 'trainer' && (
        <div className="pt-4 border-t border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Employment Details</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Monthly Salary ($)</label>
            <input
              type="number"
              name="salary"
              defaultValue={user.user_profiles?.[0]?.salary || ''}
              placeholder="3500.00"
              step="0.01"
              min="0"
              className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      <div className="pt-4 flex gap-4">
        <Link
          href={role === 'trainer' ? "/admin/trainers" : "/admin/members"}
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
  );
}
