import { redirect } from 'next/navigation';

export default function SuperuserPage() {
  redirect('/superuser/dashboard');
}
