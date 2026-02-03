import { SignIn } from '@clerk/nextjs';
import { Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { dark } from '@clerk/themes';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <Dumbbell className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-foreground">Rise Fitness</span>
        </Link>

        {/* Sign In Card */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-foreground mb-1">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <SignIn 
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: '#6366f1', // Indigo-500 matching app theme
                colorBackground: 'transparent',
                colorInputBackground: 'transparent',
                colorInputText: 'white',
              },
              elements: {
                rootBox: "w-full",
                card: "!bg-transparent shadow-none p-0 w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-none font-semibold",
                formFieldInput: "bg-muted border-border text-foreground focus:border-primary transition-colors",
                formFieldLabel: "text-muted-foreground font-medium text-sm",
                footerActionLink: "text-primary hover:text-primary/80",
                socialButtonsBlockButton: "bg-muted border-border text-foreground hover:bg-muted/80",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
                formFieldAction: "text-muted-foreground hover:text-foreground text-sm",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary hover:text-primary/80",
                main: "gap-4"
              }
            }}
            fallbackRedirectUrl="/api/auth/callback"
          />
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
