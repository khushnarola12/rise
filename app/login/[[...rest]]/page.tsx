import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">
      <SignIn appearance={{ baseTheme: dark }} />
    </div>
  );
}
