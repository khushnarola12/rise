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
  Settings
} from 'lucide-react';
import { SignOutBtn } from '@/components/sign-out-btn';
import { updateOwnProfile } from '@/app/actions/member-self-service';

interface ProfileSettingsProps {
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
    role: string;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
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
        <div className={`p-4 rounded-xl flex items-center gap-2 animate-in ${
          message.type === 'success' 
            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
            : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Account Settings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Account Settings</h3>
            <p className="text-sm text-muted-foreground">Update your phone number</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/30">
          <label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
            <Phone className="w-3 h-3" />
            Phone Number
          </label>
          <div className="flex gap-3">
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
              className="px-6 py-2.5 gradient-primary rounded-xl font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
            <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              theme === 'light'
                ? 'border-primary bg-primary/5'
                : 'border-transparent bg-muted/30 hover:border-primary/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              theme === 'light' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <Sun className="w-5 h-5" />
            </div>
            <span className={`text-sm font-medium ${theme === 'light' ? 'text-primary' : 'text-foreground'}`}>
              Light
            </span>
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              theme === 'dark'
                ? 'border-primary bg-primary/5'
                : 'border-transparent bg-muted/30 hover:border-primary/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <Moon className="w-5 h-5" />
            </div>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-primary' : 'text-foreground'}`}>
              Dark
            </span>
          </button>
          
          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              theme === 'system'
                ? 'border-primary bg-primary/5'
                : 'border-transparent bg-muted/30 hover:border-primary/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              theme === 'system' ? 'gradient-secondary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <Monitor className="w-5 h-5" />
            </div>
            <span className={`text-sm font-medium ${theme === 'system' ? 'text-primary' : 'text-foreground'}`}>
              System
            </span>
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Security</h3>
            <p className="text-sm text-muted-foreground">Sign out of your account</p>
          </div>
        </div>

        <SignOutBtn className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </SignOutBtn>
      </div>
    </div>
  );
}
