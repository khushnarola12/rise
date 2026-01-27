'use client';

import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteUser, toggleUserStatus } from '@/app/actions/users';

interface UserActionsMenuProps {
  userId: string;
  userRole: 'trainer' | 'user';
  isActive: boolean;
}

export function UserActionsMenu({ userId, userRole, isActive }: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const basePath = userRole === 'trainer' ? '/admin/trainers' : '/admin/members';

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    setIsLoading(true);
    try {
      await deleteUser(userId, userRole);
      setIsOpen(false);
    } catch (error) {
      alert('Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleStatus() {
    setIsLoading(true);
    try {
      await toggleUserStatus(userId, !isActive, userRole);
      setIsOpen(false);
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <MoreVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-1.5 space-y-1">
              <Link
                href={`${basePath}/${userId}/edit`}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit Details
              </Link>
              
              <button
                disabled={isLoading}
                onClick={handleToggleStatus}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors text-left"
              >
                {isActive ? (
                  <>
                    <X className="w-4 h-4 text-orange-500" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Activate
                  </>
                )}
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
    </div>
  );
}
