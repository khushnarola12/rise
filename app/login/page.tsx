import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black/95">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
      <div className="relative z-10">
        <SignIn 
            appearance={{
                baseTheme: dark,
                variables: { 
                    colorPrimary: '#3b82f6', 
                    colorBackground: '#09090b',
                    colorInputBackground: '#27272a',
                    colorInputText: '#fff',
                    colorText: '#fff',
                    borderRadius: '0.75rem'
                },
                elements: {
                    rootBox: "mx-auto",
                    card: "bg-zinc-950 border border-zinc-800 shadow-2xl backdrop-blur-sm",
                    headerTitle: "text-zinc-100",
                    headerSubtitle: "text-zinc-400",
                    socialButtonsBlockButton: "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                    dividerLine: "bg-zinc-800",
                    dividerText: "text-zinc-500",
                    formFieldLabel: "text-zinc-400",
                    formFieldInput: "bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:border-blue-500",
                    footerActionLink: "text-blue-400 hover:text-blue-300",
                    identityPreviewText: "text-zinc-300",
                    identityPreviewEditButton: "text-blue-400",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                }
            }}
        />
      </div>
    </div>
  );
}
