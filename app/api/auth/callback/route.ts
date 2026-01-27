import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUserData, getRoleBasedRedirect } from '@/lib/auth';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL));
    }

    // Get user data and role
    const userData = await getCurrentUserData();

    if (!userData) {
      // User not found in database - they need to be created by admin first
      return NextResponse.redirect(
        new URL('/unauthorized?reason=not_registered', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    if (!userData.is_active) {
      // User account is deactivated
      return NextResponse.redirect(
        new URL('/unauthorized?reason=deactivated', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Redirect to role-based dashboard
    const redirectUrl = getRoleBasedRedirect(userData.role);
    return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_APP_URL));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL));
  }
}
