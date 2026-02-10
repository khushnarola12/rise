'use client';

import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, X, Check, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteUser, toggleUserStatus, resendUserInvitation } from '@/app/actions/users';

interface UserActionsMenuProps {
  userId: string;
  userRole: 'trainer' | 'user' | 'admin';
  isActive: boolean;
}

export function UserActionsMenu({ userId, userRole, isActive }: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const router = useRouter();

  let basePath = '/admin/members';
  if (userRole === 'trainer') basePath = '/admin/trainers';
  else if (userRole === 'admin') basePath = '/superuser/admins';

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    setIsLoading(true);
    try {
      await deleteUser(userId, userRole);
      setIsOpen(false);
    } catch (error: any) {
      alert(error.message || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(newStatus: boolean) {
    setIsLoading(true);
    try {
      await toggleUserStatus(userId, newStatus, userRole);
      setIsOpen(false);
    } catch (error: any) {
      alert(error.message || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendInvite() {
    setIsLoading(true);
    try {
      await resendUserInvitation(userId, userRole);
      alert('Invitation sent successfully');
      setIsOpen(false);
    } catch (error: any) {
      alert(error.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const MENU_HEIGHT = 180; // Approximate max height of menu
    const MENU_WIDTH = 224;  // w-56
    
    // Check if there's enough space below
    const spaceBelow = viewportHeight - rect.bottom;
    const openUp = spaceBelow < MENU_HEIGHT;
    
    setMenuPosition({
      // If opening up: Top is button top - menu height
      // If opening down: Top is button bottom
      top: openUp ? rect.top - MENU_HEIGHT : rect.bottom,
      left: rect.right - MENU_WIDTH
    });
    
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="p-2 hover:bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary relative z-10"
      >
        <MoreVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="fixed z-50 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`
            }}
          >
            <div className="p-1.5 space-y-1">
              <Link
                href={`${basePath}/${userId}/edit`}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Pencil className="w-4 h-4" />
                Edit Details
              </Link>
              
              {isActive ? (
                <button
                  disabled={isLoading}
                  onClick={() => handleStatusChange(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors text-left"
                >
                  <X className="w-4 h-4 text-orange-500" />
                  Deactivate
                </button>
              ) : (
                <button
                  disabled={isLoading}
                  onClick={() => handleStatusChange(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors text-left"
                >
                  <Check className="w-4 h-4 text-green-500" />
                  Activate
                </button>
              )}

              <button
                disabled={isLoading}
                onClick={handleResendInvite}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors text-left"
              >
                <Mail className="w-4 h-4" />
                Resend Invite
              </button>

              <div className="h-px bg-border my-1" />
              
              <button
                disabled={isLoading}
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors text-left"
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
