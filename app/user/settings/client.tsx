'use client';

import { useState, useTransition } from 'react';
import { useTheme } from 'next-themes';
import { 
  User, 
  Moon, 
  Sun, 
  Monitor, 
  Shield, 
  LogOut, 
  Check, 
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  Palette,
  Sparkles
} from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import { updateOwnProfile } from '@/app/actions/member-self-service';

interface SettingsClientProps {
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
    role: string;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [phone, setPhone] = useState(user.phone || '');

  const handleUpdatePhone = () => {
    startTransition(async () => {
      const result = await updateOwnProfile({ phone });
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message || result.error || '',
      });
    });
  };

  // Auto-clear messages
  if (message) {
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl glass flex items-center gap-2 animate-in ${
          message.type === 'success' 
            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
            : 'bg-red-500/10 text-red-500 border-red-500/20'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Account Information */}
      <div className="glass rounded-2xl p-6 card-hover">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center glow-sm">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Account Information</h2>
            <p className="text-sm text-muted-foreground">Your personal details</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="p-4 rounded-xl glass-subtle">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</label>
            <p className="text-lg font-semibold text-foreground mt-1">
              {user.first_name} {user.last_name}
            </p>
          </div>

          <div className="p-4 rounded-xl glass-subtle">
            <label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Mail className="w-3 h-3" />
              Email Address
            </label>
            <p className="text-foreground mt-1">{user.email}</p>
          </div>

          <div className="p-4 rounded-xl glass-subtle">
            <label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
              <Phone className="w-3 h-3" />
              Phone Number
            </label>
            <div className="flex gap-3 mt-1">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl"
                placeholder="Enter phone number"
              />
              <button
                onClick={handleUpdatePhone}
                disabled={isPending || phone === user.phone}
                className="px-6 py-2.5 gradient-primary rounded-xl font-semibold disabled:opacity-50 hover-lift"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass rounded-2xl p-6 card-hover">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center glow-sm">
            <Palette className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Appearance</h2>
            <p className="text-sm text-muted-foreground">Customize your visual experience</p>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-4 block">
            Choose Theme
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`group flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all hover-lift ${
                theme === 'light'
                  ? 'border-primary bg-primary/5 glow-sm'
                  : 'border-transparent glass-subtle hover:border-primary/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                theme === 'light' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-muted text-muted-foreground group-hover:bg-amber-500/20 group-hover:text-amber-500'
              }`}>
                <Sun className="w-6 h-6" />
              </div>
              <span className={`text-sm font-semibold ${theme === 'light' ? 'text-primary' : 'text-foreground'}`}>
                Light
              </span>
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={`group flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all hover-lift ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5 glow-sm'
                  : 'border-transparent glass-subtle hover:border-primary/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                theme === 'dark' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-muted text-muted-foreground group-hover:bg-indigo-500/20 group-hover:text-indigo-500'
              }`}>
                <Moon className="w-6 h-6" />
              </div>
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-primary' : 'text-foreground'}`}>
                Dark
              </span>
            </button>
            
            <button
              onClick={() => setTheme('system')}
              className={`group flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all hover-lift ${
                theme === 'system'
                  ? 'border-primary bg-primary/5 glow-sm'
                  : 'border-transparent glass-subtle hover:border-primary/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                theme === 'system' 
                  ? 'gradient-secondary' 
                  : 'bg-muted text-muted-foreground group-hover:bg-blue-500/20 group-hover:text-blue-500'
              }`}>
                <Monitor className="w-6 h-6" />
              </div>
              <span className={`text-sm font-semibold ${theme === 'system' ? 'text-primary' : 'text-foreground'}`}>
                System
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass rounded-2xl p-6 card-hover">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center glow-sm">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Security</h2>
            <p className="text-sm text-muted-foreground">Manage your account security</p>
          </div>
        </div>

        <SignOutButton>
          <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover-lift transition-all flex items-center justify-center gap-3 glow-sm hover:glow-md">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
