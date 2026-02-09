import { redirect } from 'next/navigation';

// Redirect to dashboard since analytics is now integrated there
export default function AnalyticsPage() {
  redirect('/admin/dashboard');
}
