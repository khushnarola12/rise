'use server';

import { clerkClient } from '@clerk/nextjs/server';

interface InvitationResult {
  success: boolean;
  message: string;
  invitationId?: string;
}

/**
 * Send an invitation email via Clerk
 * This creates a Clerk Invitation - user receives email with sign-up link.
 * No public signup page exists - only invited users can join.
 */
export async function sendInvitationEmail(
  email: string,
  role: 'admin' | 'trainer' | 'user',
  firstName: string,
  lastName: string
): Promise<InvitationResult> {
  try {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/+$/, '');
    
    console.log(`📧 Sending Clerk invitation to ${email} for role: ${role}`);
    
    const clerk = await clerkClient();
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${appUrl}/`,
      publicMetadata: {
        role,
        firstName,
        lastName
      },
      ignoreExisting: true
    });

    console.log(`✉️ Invitation sent successfully: ${invitation.id}`);
    
    return {
      success: true,
      message: `Invitation email sent successfully to ${email}`,
      invitationId: invitation.id
    };
  } catch (error: any) {
    console.error('Failed to send Clerk invitation:', error);
    
    const errorMsg = error.errors?.[0]?.message || error.message || 'Failed to send invitation';
    
    if (errorMsg.includes('already_exists')) {
       return {
         success: false,
         message: 'This email is already invited or registered.'
       };
    }

    return {
      success: false,
      message: errorMsg
    };
  }
}

/**
 * Revoke a pending invitation
 */
export async function revokeInvitation(invitationId: string): Promise<InvitationResult> {
  try {
    const clerk = await clerkClient();
    const invitation = await clerk.invitations.revokeInvitation(invitationId);
    
    if (invitation.status !== 'revoked') {
        throw new Error('Failed to revoke invitation');
    }
    
    return {
      success: true,
      message: 'Invitation revoked successfully'
    };
  } catch (error: any) {
    console.error('Failed to revoke invitation:', error);
    return {
      success: false,
      message: error.message || 'Failed to revoke invitation'
    };
  }
}

/**
 * Resend invitation email
 */
export async function resendInvitation(
  email: string,
  role: 'admin' | 'trainer' | 'user',
  firstName: string,
  lastName: string
): Promise<InvitationResult> {
  return await sendInvitationEmail(email, role, firstName, lastName);
}

/**
 * Get pending invitation for an email
 */
export async function getPendingInvitation(email: string) {
    try {
        const clerk = await clerkClient();
        const invitations = await clerk.invitations.getInvitationList({
            status: 'pending'
        });
        
        return invitations.data.find(inv => inv.emailAddress === email) || null;
    } catch (e) {
        return null;
    }
}
