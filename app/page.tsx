import { redirect } from 'next/navigation';
import { getCurrentUserData, getRoleBasedRedirect } from '@/lib/auth';
import { auth } from '@clerk/nextjs/server';
import LandingPage from '@/components/landing-page';

export default async function HomePage() {
  const { userId } = await auth();

  // If user is logged in via Clerk, redirect to their dashboard
  if (userId) {
    const userData = await getCurrentUserData();
    if (userData) {
      redirect(getRoleBasedRedirect(userData.role));
    }
    // Authenticated but no user record found - redirect to unauthorized
    redirect('/unauthorized?reason=not_registered');
  }

  return <LandingPage />;
}
