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
    href: '/superuser/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Admins',
    href: '/superuser/admins',
    icon: 'UserCog',
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

  // Strict role check - only superusers allowed
  if (!user || user.role !== 'superuser') {
    redirect(user ? '/' : '/login');
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
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav items={sidebarItems} maxVisible={4} />
    </div>
  );
}

