import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)"
]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/dashboard(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
}, {
  // Allow a standard 5-minute clock skew to prevent false session rejections 
  // if the local system time is slightly out of sync with Clerk's servers.
  clockSkewInMs: 5 * 60 * 1000,
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
