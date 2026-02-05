import { SignIn } from '@clerk/nextjs';
import { Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { dark } from '@clerk/themes';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-3 py-6 sm:p-6 overflow-x-hidden">
      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground flex-shrink-0">
            <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-foreground">Rise Fitness</span>
        </Link>

        {/* Sign In Card */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 md:p-8 overflow-hidden">
          <div className="mb-4 sm:mb-6 text-center">
            <h1 className="text-lg sm:text-xl font-bold text-foreground mb-1">Welcome Back</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <div className="overflow-x-hidden">
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
                  rootBox: "w-full max-w-full overflow-hidden",
                  card: "!bg-transparent shadow-none p-0 w-full max-w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-none font-semibold w-full",
                  formFieldInput: "bg-muted border-border text-foreground focus:border-primary transition-colors w-full",
                  formFieldLabel: "text-muted-foreground font-medium text-xs sm:text-sm",
                  footerActionLink: "text-primary hover:text-primary/80 text-xs sm:text-sm",
                  socialButtonsBlockButton: "bg-muted border-border text-foreground hover:bg-muted/80 w-full text-sm",
                  socialButtonsProviderIcon: "w-4 h-4 sm:w-5 sm:h-5",
                  dividerLine: "bg-border",
                  dividerText: "text-muted-foreground text-xs sm:text-sm",
                  formFieldAction: "text-muted-foreground hover:text-foreground text-xs sm:text-sm",
                  identityPreviewText: "text-foreground text-sm",
                  identityPreviewEditButton: "text-primary hover:text-primary/80 text-xs sm:text-sm",
                  main: "gap-3 sm:gap-4",
                  footer: "text-xs sm:text-sm",
                  form: "gap-3 sm:gap-4"
                }
              }}
              fallbackRedirectUrl="/api/auth/callback"
            />
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4 sm:mt-6">
          <Link href="/" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
