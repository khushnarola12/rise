import { AlertTriangle, Lock, UserX, Building2 } from 'lucide-react';
import Link from 'next/link';
import { SignOutBtn } from '@/components/sign-out-btn';

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason || 'unknown';

  const messages = {
    not_registered: {
      icon: UserX,
      title: 'Account Not Found',
      description: 'Your account has not been created in the system yet. Please contact your gym administrator to create your account.',
    },
    deactivated: {
      icon: Lock,
      title: 'Account Deactivated',
      description: 'Your account has been deactivated. Please contact your gym administrator for assistance.',
    },
    gym_deactivated: {
      icon: Building2,
      title: 'Gym Deactivated',
      description: 'Your gym has been deactivated by the system administrator. All services are temporarily unavailable. Please contact your gym owner for more information.',
    },
    insufficient_permissions: {
      icon: AlertTriangle,
      title: 'Access Denied',
      description: 'You do not have permission to access this resource.',
    },
    unknown: {
      icon: AlertTriangle,
      title: 'Unauthorized',
      description: 'You are not authorized to access this page.',
    },
  };

  const message = messages[reason as keyof typeof messages] || messages.unknown;
  const Icon = message.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3">{message.title}</h1>
          <p className="text-muted-foreground mb-6">{message.description}</p>

          <div className="space-y-3">
            <SignOutBtn className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50">
              Sign Out
            </SignOutBtn>

            <Link
              href="/"
              className="block w-full px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium text-center"
            >
              Back to Home
            </Link>
          </div>

          {reason === 'not_registered' && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Only gym administrators can create new accounts. Please contact your gym's front desk for assistance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
