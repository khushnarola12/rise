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
    href: '/admin/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Trainers',
    href: '/admin/trainers',
    icon: 'UserCog',
  },
  {
    title: 'Members',
    href: '/admin/members',
    icon: 'Users',
  },
  {
    title: 'Workouts',
    href: '/admin/workouts',
    icon: 'Dumbbell',
  },
  {
    title: 'Diet Plans',
    href: '/admin/diets',
    icon: 'Utensils',
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserData();

  // Strict role check
  if (!user || user.role !== 'admin') {
    redirect('/unauthorized?reason=insufficient_permissions');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={sidebarItems}
        logo={
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <DumbbellIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Rise Fitness</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </Link>
        }
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav items={sidebarItems} maxVisible={5} />
    </div>
  );
}

