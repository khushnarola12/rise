import { SignOutButton } from '@clerk/nextjs';
import { AlertTriangle, Lock, UserX } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon className="w-10 h-10 text-red-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">{message.title}</h1>
          <p className="text-gray-300 mb-8">{message.description}</p>

          <div className="space-y-4">
            <SignOutButton>
              <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 font-semibold">
                Sign Out
              </button>
            </SignOutButton>

            <Link
              href="/"
              className="block w-full px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-semibold"
            >
              Back to Home
            </Link>
          </div>

          {reason === 'not_registered' && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-200">
                <strong>Note:</strong> Only gym administrators and superusers can create new accounts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
