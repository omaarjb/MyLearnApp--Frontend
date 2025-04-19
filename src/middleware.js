import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Export a function that wraps clerkMiddleware
export default clerkMiddleware((req) => {
  // This will run after Clerk's auth check
  // We need to return NextResponse.next() to continue the request
  return NextResponse.next()
})

// Override Clerk's default redirects
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
