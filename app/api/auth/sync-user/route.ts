import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureDbUser } from "@/lib/auth/user";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDbUser(userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Sync user error:", err);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}