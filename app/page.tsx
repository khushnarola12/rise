import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserData, getRoleBasedRedirect } from '@/lib/auth';
import LandingPage from '@/components/landing-page';

export default async function HomePage() {
  const { userId } = await auth();

  // If user is logged in, redirect to their dashboard
  if (userId) {
    const userData = await getCurrentUserData();
    if (userData) {
      redirect(getRoleBasedRedirect(userData.role));
    }
  }

  return <LandingPage />;
}
