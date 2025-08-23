import { cn } from "@/lib/utils"; // shadcn utility for merging class names

export function InvertedSection({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "bg-background text-foreground", // use theme-aware colors
        "dark:bg-background dark:text-foreground" // ensure it works both ways
      )}
    >
      {children}
    </div>
  );
}
