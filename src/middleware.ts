import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default clerkMiddleware(async (auth, req) => {
  const {  userId } = await auth();

  // Check if user is trying to access admin routes
  if (isAdminRoute(req)) {
    // If not authenticated, redirect to sign-in
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    try {
      // Check if user has admin role
      const isAdmin = await convex.query(api.users.isUserAdmin, {
        clerkUserId: userId,
      });

      // If not admin, redirect to home
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      // On error, redirect to home for security
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
