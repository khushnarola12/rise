'use client';

import { useState, useTransition } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle, AlertCircle, Megaphone, Plus, Loader2, Trash2 } from 'lucide-react';
import { createAnnouncement, deleteAnnouncement } from '@/app/actions/announcements';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'important';
  created_at: string;
  author?: {
    first_name: string;
    last_name: string;
  };
}

interface AnnouncementBannerProps {
  announcements: Announcement[];
  canManage?: boolean;
}

const typeConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    text: 'text-yellow-500',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-500',
  },
  important: {
    icon: AlertCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-500',
  },
};

export function AnnouncementBanner({ announcements, canManage = false }: AnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteAnnouncement(id);
    });
  };

  return (
    <div className="space-y-3 mb-6">
      {visibleAnnouncements.map((announcement) => {
        const config = typeConfig[announcement.type] || typeConfig.info;
        const Icon = config.icon;

        return (
          <div
            key={announcement.id}
            className={`${config.bg} ${config.border} border rounded-xl p-4 animate-in slide-in-from-top`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 ${config.bg} rounded-lg`}>
                <Icon className={`w-5 h-5 ${config.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${config.text}`}>{announcement.title}</h4>
                <p className="text-foreground/80 text-sm mt-1">{announcement.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {announcement.author && `By ${announcement.author.first_name} ${announcement.author.last_name} • `}
                  {new Date(announcement.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canManage && (
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    disabled={isPending}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setDismissedIds([...dismissedIds, announcement.id])}
                  className="p-1 hover:bg-muted rounded"
                  title="Dismiss"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Create Announcement Form
interface CreateAnnouncementFormProps {
  onClose?: () => void;
}

export function CreateAnnouncementForm({ onClose }: CreateAnnouncementFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'important',
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      setMessage({ type: 'error', text: 'Title and content are required' });
      return;
    }

    startTransition(async () => {
      const result = await createAnnouncement(formData);
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Announcement created!' });
        setFormData({ title: '', content: '', type: 'info' });
        setTimeout(() => {
          onClose?.();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed' });
      }
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Create Announcement</h3>
        </div>
        {onClose && (
          <button onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-sm text-muted-foreground">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg mt-1"
            placeholder="Announcement title"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg mt-1"
            rows={3}
            placeholder="What would you like to announce?"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg mt-1"
          >
            <option value="info">ℹ️ Info</option>
            <option value="success">✅ Success</option>
            <option value="warning">⚠️ Warning</option>
            <option value="important">🚨 Important</option>
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Megaphone className="w-4 h-4" />
              Post Announcement
            </>
          )}
        </button>
      </div>
    </div>
  );
}
