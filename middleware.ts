import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Allow up to 24 hours of clock skew to completely prevent infinite redirect loops
  // caused by the local system time being out of sync with Clerk's servers.
  clockSkewInMs: 24 * 60 * 60 * 1000,
} as any);

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
