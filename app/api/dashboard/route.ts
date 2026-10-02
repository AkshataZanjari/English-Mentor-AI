import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      history: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const totalChecks = dbUser.history.length;
  const correctedCount = dbUser.history.filter(
    (item) => item.originalText !== item.correctedText
  ).length;
  const correctCount = totalChecks - correctedCount;

  const recentHistory = dbUser.history.slice(0, 10);

  const chartMap: Record<string, number> = {};

  dbUser.history.forEach((item) => {
    const date = new Date(item.createdAt).toLocaleDateString("en-CA");
    chartMap[date] = (chartMap[date] || 0) + 1;
  });

  const chartData = Object.entries(chartMap).map(([date, checks]) => ({
    date,
    checks,
  }));

  return NextResponse.json({
    totalChecks,
    correctedCount,
    correctCount,
    recentHistory,
    chartData,
  });
}