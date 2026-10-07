import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.emailAddresses[0]?.emailAddress || "";

  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  try {
    await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        name,
        email,
      },
      create: {
        clerkId: userId,
        name,
        email,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Sync user error:", err);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}