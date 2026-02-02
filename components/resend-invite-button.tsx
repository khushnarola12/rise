'use client';

import { useState } from 'react';
import { Mail, Loader2, Check, X, RefreshCw } from 'lucide-react';
import { resendInvitation } from '@/lib/email';

interface ResendInviteButtonProps {
  email: string;
  role: 'admin' | 'trainer' | 'user';
  firstName: string;
  lastName: string;
  /** Show as icon only (for table rows) or full button */
  variant?: 'icon' | 'button';
  /** If true, user hasn't claimed their account yet */
  isPending?: boolean;
}

export function ResendInviteButton({
  email,
  role,
  firstName,
  lastName,
  variant = 'button',
  isPending = true
}: ResendInviteButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setStatus('loading');
    setMessage('');
    
    try {
      const result = await resendInvitation(email, role, firstName, lastName);
      
      if (result.success) {
        setStatus('success');
        setMessage('Invitation sent!');
        // Reset after 3 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.message);
        // Reset after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to send invitation');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  // Don't show if user has already claimed their account
  if (!isPending) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <div className="relative group">
        <button
          onClick={handleResend}
          disabled={status === 'loading'}
          className={`p-2 rounded-full transition-colors ${
            status === 'success' 
              ? 'bg-green-500/10 text-green-500' 
              : status === 'error'
              ? 'bg-red-500/10 text-red-500'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
          title="Resend invitation email"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === 'success' ? (
            <Check className="w-4 h-4" />
          ) : status === 'error' ? (
            <X className="w-4 h-4" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md border border-border">
          {message || 'Resend invitation'}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleResend}
      disabled={status === 'loading'}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
        status === 'success'
          ? 'bg-green-500/10 text-green-500'
          : status === 'error'
          ? 'bg-red-500/10 text-red-500'
          : 'bg-primary/10 text-primary hover:bg-primary/20'
      }`}
    >
      {status === 'loading' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Sending...
        </>
      ) : status === 'success' ? (
        <>
          <Check className="w-4 h-4" />
          Sent!
        </>
      ) : status === 'error' ? (
        <>
          <X className="w-4 h-4" />
          {message || 'Failed'}
        </>
      ) : (
        <>
          <Mail className="w-4 h-4" />
          Resend Invite
        </>
      )}
    </button>
  );
}

/**
 * Badge to show invitation pending status
 */
export function InvitePendingBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full">
      <Mail className="w-3 h-3" />
      Invite Pending
    </span>
  );
}
