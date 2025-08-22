import { SignIn } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to continue making a difference
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground",
              card: "bg-card border shadow-lg",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton:
                "bg-background border border-input hover:bg-accent hover:text-accent-foreground",
              formFieldInput: "bg-background border border-input",
              footerActionLink: "text-primary hover:text-primary/90",
            },
            theme: shadcn,
          }}
        />
      </div>
    </div>
  );
}
