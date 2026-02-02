import { getCurrentUserData } from '@/lib/auth';
import { Settings, User, Bell, Moon, Shield, LogOut } from 'lucide-react';
import Link from 'next/link';
import { SettingsClient } from './client';

export default async function UserSettingsPage() {
  const user = await getCurrentUserData();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <SettingsClient user={user} />
    </div>
  );
}
