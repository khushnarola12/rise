import { redirect } from 'next/navigation';
import { getCurrentUserData } from '@/lib/auth';
import { Sidebar, SidebarItem } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Dumbbell as DumbbellIcon } from 'lucide-react';
import Link from 'next/link';

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/user/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'My Profile',
    href: '/user/profile',
    icon: 'User',
  },
  {
    title: 'My Workout',
    href: '/user/workout',
    icon: 'Dumbbell',
  },
  {
    title: 'My Diet',
    href: '/user/diet',
    icon: 'Calendar',
  },
  {
    title: 'Attendance',
    href: '/user/attendance',
    icon: 'ClipboardList',
  },
  {
    title: 'Progress',
    href: '/user/progress',
    icon: 'TrendingUp',
  },
];

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserData();

  // Strict role check
  if (!user || user.role !== 'user') {
    redirect('/unauthorized?reason=insufficient_permissions');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={sidebarItems}
        logo={
          <Link href="/user/dashboard" className="flex items-center gap-2">
            <DumbbellIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Rise Fitness</h1>
              <p className="text-xs text-muted-foreground">Member Portal</p>
            </div>
          </Link>
        }
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
