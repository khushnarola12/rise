import { SignIn } from '@clerk/nextjs';
import { Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { dark } from '@clerk/themes';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-black" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">Rise Fitness</span>
        </Link>

        {/* Sign In Card */}
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to access your dashboard</p>
          </div>

          <SignIn 
            appearance={{
              baseTheme: dark,
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary: "bg-white text-black hover:bg-gray-200 shadow-none font-bold",
                formFieldInput: "bg-black/50 border-white/10 text-white focus:border-white/30 transition-colors",
                formFieldLabel: "text-gray-400 font-medium",
                footerActionLink: "text-white hover:text-gray-300 underline-offset-4",
                socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                dividerLine: "bg-white/10",
                dividerText: "text-gray-500",
                formFieldAction: "text-gray-400 hover:text-white",
                identityPreviewText: "text-gray-300",
                identityPreviewEditButton: "text-white hover:text-gray-300"
              }
            }}
            fallbackRedirectUrl="/api/auth/callback"
          />

          {/* Info Box */}
          <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-sm text-gray-400 text-center leading-relaxed">
              <strong className="text-white block mb-1">Access Required</strong>
              Only authorized users can sign in. Contact your gym administrator for access.
            </p>
          </div>
          
           {/* Superuser Info */}
           <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs text-gray-400 text-center">
              <strong className="text-white">Superuser:</strong> khushnarola08@gmail.com
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
