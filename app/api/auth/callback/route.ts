import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUserData, getRoleBasedRedirect } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Get the base URL from the request to handle different domains correctly
  const baseUrl = request.nextUrl.origin;
  
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', baseUrl));
    }

    // Get user data and role
    const userData = await getCurrentUserData();

    if (!userData) {
      // User not found in database - they need to be created by admin first
      return NextResponse.redirect(
        new URL('/unauthorized?reason=not_registered', baseUrl)
      );
    }

    if (!userData.is_active) {
      // User account is deactivated
      return NextResponse.redirect(
        new URL('/unauthorized?reason=deactivated', baseUrl)
      );
    }

    // Redirect to role-based dashboard
    const redirectUrl = getRoleBasedRedirect(userData.role);
    return NextResponse.redirect(new URL(redirectUrl, baseUrl));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/sign-in?error=callback_failed', baseUrl));
  }
}
