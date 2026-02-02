'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Shield, 
  Database,
  Moon,
  Sun,
  Monitor,
  Save,
  RefreshCw,
  Check,
  Download,
  Key,
  Eye
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SuperuserSettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState({
    newAdmin: true,
    newGym: true,
    systemAlerts: true,
    weeklyReport: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage system preferences and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Appearance Settings */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-border bg-muted/30">
              <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-primary" />
                </div>
                Appearance
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 ml-10">Customize the look and feel</p>
            </div>
            <div className="p-4 sm:p-5">
              <label className="text-sm font-medium text-foreground block mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <ThemeButton 
                  active={mounted && resolvedTheme === 'light' && theme === 'light'}
                  onClick={() => setTheme('light')}
                  icon={<Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />}
                  label="Light"
                  mounted={mounted}
                />
                <ThemeButton 
                  active={mounted && resolvedTheme === 'dark' && theme === 'dark'}
                  onClick={() => setTheme('dark')}
                  icon={<Moon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />}
                  label="Dark"
                  mounted={mounted}
                />
                <ThemeButton 
                  active={mounted && theme === 'system'}
                  onClick={() => setTheme('system')}
                  icon={<Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />}
                  label="System"
                  mounted={mounted}
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-border bg-muted/30">
              <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-500" />
                </div>
                Security
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 ml-10">Manage security settings</p>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <SettingRow 
                icon={<Key className="w-4 h-4 text-primary" />}
                title="Two-Factor Authentication"
                description="Add an extra layer of security"
                action={
                  <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                    Enable
                  </button>
                }
              />
              <SettingRow 
                icon={<Eye className="w-4 h-4 text-blue-500" />}
                title="Session Management"
                description="View and manage active sessions"
                action={
                  <button className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-muted/80 transition-colors whitespace-nowrap">
                    View
                  </button>
                }
              />
            </div>
          </div>

          {/* Database & System */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-border bg-muted/30">
              <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Database className="w-4 h-4 text-purple-500" />
                </div>
                System
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 ml-10">System maintenance and data management</p>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <SettingRow 
                icon={<RefreshCw className="w-4 h-4 text-muted-foreground" />}
                title="Clear Cache"
                description="Clear cached data to free up space"
                action={
                  <button className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    <RefreshCw className="w-3 h-3" />
                    Clear
                  </button>
                }
              />
              <SettingRow 
                icon={<Download className="w-4 h-4 text-amber-500" />}
                title="Export All Data"
                description="Download a complete backup"
                highlight
                action={
                  <button className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-amber-600 transition-colors whitespace-nowrap">
                    Export
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* Right Column - Notifications */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-border bg-muted/30">
              <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-500" />
                </div>
                Notifications
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 ml-10">Configure notification preferences</p>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <NotificationToggle
                label="New Admin Created"
                description="Get notified when a new admin account is created"
                checked={notifications.newAdmin}
                onChange={(checked) => setNotifications({ ...notifications, newAdmin: checked })}
              />
              <NotificationToggle
                label="New Gym Registered"
                description="Get notified when a new gym is added to the system"
                checked={notifications.newGym}
                onChange={(checked) => setNotifications({ ...notifications, newGym: checked })}
              />
              <NotificationToggle
                label="System Alerts"
                description="Important system notifications and warnings"
                checked={notifications.systemAlerts}
                onChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })}
              />
              <NotificationToggle
                label="Weekly Report"
                description="Receive a weekly summary of all gym activities"
                checked={notifications.weeklyReport}
                onChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
              />
            </div>
          </div>

          {/* Save Button Card */}
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Save Your Changes</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Make sure to save before leaving</p>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 ${
                  saveSuccess 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Saved!</span>
                  </>
                ) : isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="text-sm sm:text-base">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeButton({ 
  active, 
  onClick, 
  icon, 
  label,
  mounted 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  mounted: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 sm:gap-2 ${
        active 
          ? 'border-primary bg-primary/10 shadow-sm' 
          : 'border-border hover:border-muted-foreground hover:bg-muted/50'
      }`}
    >
      {active && (
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
        </div>
      )}
      {mounted ? icon : <div className="w-5 h-5 sm:w-6 sm:h-6 bg-muted rounded animate-pulse" />}
      <p className="text-xs sm:text-sm font-medium text-foreground">{label}</p>
    </button>
  );
}

function SettingRow({ 
  icon, 
  title, 
  description, 
  action,
  highlight = false
}: { 
  icon: React.ReactNode;
  title: string; 
  description: string; 
  action: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg gap-3 ${
      highlight 
        ? 'bg-amber-500/10 border border-amber-500/20' 
        : 'bg-muted/50'
    }`}>
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground text-sm sm:text-base">{title}</p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function NotificationToggle({ 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  label: string; 
  description: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground text-sm sm:text-base">{label}</p>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
          checked 
            ? 'bg-emerald-500' 
            : 'bg-muted-foreground/40'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

