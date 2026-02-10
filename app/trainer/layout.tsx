import { redirect } from 'next/navigation';
import { getCurrentUserData } from '@/lib/auth';
import { Sidebar, SidebarItem } from '@/components/sidebar';
import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { Dumbbell as DumbbellIcon } from 'lucide-react';
import Link from 'next/link';

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/trainer/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'My Members',
    href: '/trainer/members',
    icon: 'Users',
  },
  {
    title: 'Workouts',
    href: '/trainer/workouts',
    icon: 'Dumbbell',
  },
  {
    title: 'Diet Plans',
    href: '/trainer/diets',
    icon: 'Calendar',
  },
  {
    title: 'Attendance',
    href: '/trainer/attendance',
    icon: 'ClipboardList',
  },
  {
    title: 'Progress',
    href: '/trainer/progress',
    icon: 'TrendingUp',
  },
];

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserData();

  // Allow trainer, admin, and superuser access
  if (!user || !['trainer', 'admin', 'superuser'].includes(user.role)) {
    redirect(user ? '/' : '/login');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={sidebarItems}
        logo={
          <Link href="/trainer/dashboard" className="flex items-center gap-2">
            <DumbbellIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Rise Fitness</h1>
              <p className="text-xs text-muted-foreground">Trainer Panel</p>
            </div>
          </Link>
        }
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav items={sidebarItems} maxVisible={4} />
    </div>
  );
}

