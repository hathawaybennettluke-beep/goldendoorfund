import { cn } from "@/lib/utils"; // shadcn utility for merging class names
import { useTheme } from "next-themes";

export function InvertedSection({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <div
      className={cn(
        theme === "dark" ? "" : "dark", // force dark theme
        "bg-background text-foreground", // use theme-aware colors
        "dark:bg-background dark:text-foreground" // ensure it works both ways
      )}
    >
      {children}
    </div>
  );
}
