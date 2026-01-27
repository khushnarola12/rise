import { redirect } from 'next/navigation';
import { getCurrentUserData } from '@/lib/auth';
import { Sidebar, SidebarItem } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Dumbbell as DumbbellIcon } from 'lucide-react';
import Link from 'next/link';

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/superuser/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Gym Profile',
    href: '/superuser/gym',
    icon: 'Building2',
  },
  {
    title: 'Admins',
    href: '/superuser/admins',
    icon: 'UserCog',
  },
  {
    title: 'Trainers',
    href: '/superuser/trainers',
    icon: 'Users',
  },
  {
    title: 'Members',
    href: '/superuser/members',
    icon: 'Users',
  },
  {
    title: 'Workouts',
    href: '/superuser/workouts',
    icon: 'Dumbbell',
  },
  {
    title: 'Diet Plans',
    href: '/superuser/diets',
    icon: 'Calendar',
  },
  {
    title: 'Analytics',
    href: '/superuser/analytics',
    icon: 'BarChart3',
  },
  {
    title: 'Settings',
    href: '/superuser/settings',
    icon: 'Settings',
  },
];

export default async function SuperuserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserData();

  // Strict role check
  if (!user || user.role !== 'superuser') {
    redirect('/unauthorized?reason=insufficient_permissions');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={sidebarItems}
        logo={
          <Link href="/superuser/dashboard" className="flex items-center gap-2">
            <DumbbellIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Rise Fitness</h1>
              <p className="text-xs text-muted-foreground">Superuser Panel</p>
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
