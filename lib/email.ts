'use server';

import { clerkClient } from '@clerk/nextjs/server';

interface InvitationResult {
  success: boolean;
  message: string;
  invitationId?: string;
}

/**
 * Send an invitation email via Clerk
 * This creates a Clerk invitation that sends an email with a magic link
 * When the user clicks the link, they can sign up and will be automatically
 * linked to their pre-created user record in Supabase (via lib/auth.ts)
 */
export async function sendInvitationEmail(
  email: string,
  role: 'admin' | 'trainer' | 'user',
  firstName: string,
  lastName: string
): Promise<InvitationResult> {
  try {
    const clerk = await clerkClient();
    
    // Create invitation via Clerk
    // This sends an email with a sign-up link
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
      publicMetadata: {
        role,
        firstName,
        lastName,
        invitedAt: new Date().toISOString()
      },
      // Notify = true means Clerk will send the email
      notify: true
    });

    console.log(`✉️ Invitation sent to ${email} for role: ${role}`);
    
    return {
      success: true,
      message: `Invitation email sent successfully to ${email}`,
      invitationId: invitation.id
    };
  } catch (error: any) {
    console.error('Failed to send invitation:', error);
    
    // Handle specific Clerk errors
    if (error?.errors?.[0]?.code === 'form_identifier_exists') {
      return {
        success: false,
        message: 'This email already has a Clerk account. They can sign in directly.'
      };
    }
    
    if (error?.errors?.[0]?.code === 'duplicate_record') {
      return {
        success: false,
        message: 'An invitation has already been sent to this email.'
      };
    }

    return {
      success: false,
      message: error?.message || 'Failed to send invitation email. Please try again.'
    };
  }
}

/**
 * Revoke a pending invitation
 */
export async function revokeInvitation(invitationId: string): Promise<InvitationResult> {
  try {
    const clerk = await clerkClient();
    await clerk.invitations.revokeInvitation(invitationId);
    
    return {
      success: true,
      message: 'Invitation revoked successfully'
    };
  } catch (error: any) {
    console.error('Failed to revoke invitation:', error);
    return {
      success: false,
      message: error?.message || 'Failed to revoke invitation'
    };
  }
}

/**
 * Get pending invitations for an email
 */
export async function getPendingInvitation(email: string) {
  try {
    const clerk = await clerkClient();
    const invitations = await clerk.invitations.getInvitationList({
      status: 'pending'
    });
    
    return invitations.data.find(inv => inv.emailAddress === email);
  } catch (error) {
    console.error('Failed to check invitations:', error);
    return null;
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
  try {
    // First, try to find and revoke any existing invitation
    const existingInvitation = await getPendingInvitation(email);
    
    if (existingInvitation) {
      await revokeInvitation(existingInvitation.id);
    }
    
    // Send a new invitation
    return await sendInvitationEmail(email, role, firstName, lastName);
  } catch (error: any) {
    console.error('Failed to resend invitation:', error);
    return {
      success: false,
      message: error?.message || 'Failed to resend invitation'
    };
  }
}
