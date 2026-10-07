import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Ensures a user exists in the database.
 * @param clerkId The Clerk user ID.
 * @returns The database user object.
 */
export async function ensureDbUser(clerkId: string) {
  // First, try to fetch without Clerk API call
  let dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (dbUser) {
    return dbUser;
  }

  // If not found, fetch Clerk details and create
  const user = await currentUser();
  if (!user || user.id !== clerkId) {
    throw new Error("Unable to fetch Clerk user or user mismatch.");
  }

  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const email = user.emailAddresses[0]?.emailAddress || null; // Use null instead of ""

  // Use upsert to avoid race conditions
  dbUser = await prisma.user.upsert({
    where: { clerkId },
    update: {
      name: name || null, // Optional: Update name/email on login if needed, or just let it be. We update it just in case.
      email,
    },
    create: {
      clerkId,
      name: name || null,
      email,
    },
  });

  return dbUser;
}
