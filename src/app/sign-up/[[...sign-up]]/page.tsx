import { SignUp } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Join Our Community</h1>
          <p className="text-muted-foreground">
            Create an account to start making an impact
          </p>
        </div>
        <SignUp
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
