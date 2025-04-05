import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/", "/sign-in", "/sign-up", "/api(.*)"],

  // Routes that users get redirected to after sign-in
  afterSignInUrl: "/quiz",

  // Routes that users get redirected to after sign-up
  afterSignUpUrl: "/quiz",
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
