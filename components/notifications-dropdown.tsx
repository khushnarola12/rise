'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, Building2 } from 'lucide-react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, type Notification } from '@/app/actions/notifications';
import { useRouter } from 'next/navigation';

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    
    // Optional: Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const data = await getUserNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    await markNotificationAsRead(id);
  }

  async function handleMarkAllRead() {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await markAllNotificationsAsRead();
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'gym_deactivated': return <Building2 className="w-4 h-4 text-red-500" />;
      case 'gym_activated': return <Check className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info': default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40 backdrop-blur-sm">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:text-primary/80 transition-colors font-medium hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse text-sm">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <Bell className="w-8 h-8 opacity-20" />
                  <p className="text-sm font-medium">No new notifications</p>
                  <p className="text-xs opacity-70">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 transition-colors hover:bg-muted/50 flex gap-3 group relative ${
                        !notification.is_read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        !notification.is_read ? 'bg-background shadow-sm ring-1 ring-border' : 'bg-muted/50'
                      }`}>
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={`text-sm font-medium leading-tight mb-1 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-2 font-medium">
                          {new Date(notification.created_at).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(notification.id);
                          }}
                          className="absolute top-4 right-4 text-xs bg-background border border-border hover:bg-muted p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3 text-muted-foreground" />
                        </button>
                      )}
                      
                      {!notification.is_read && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary group-hover:opacity-0 transition-opacity" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
