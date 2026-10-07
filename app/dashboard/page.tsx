import { auth } from "@clerk/nextjs/server";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import SafeRedirect from "@/components/SafeRedirect";
import { prisma } from "@/lib/prisma";
import ProgressChart from "@/components/ProgressChart";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContainer } from "@/components/ui/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { ensureDbUser } from "@/lib/auth/user";
import { getActiveStreak } from "@/lib/streak";

export default function DashboardPage() {
  return (
    <>
      <SignedOut>
        <SafeRedirect />
      </SignedOut>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
    </>
  );
}

async function DashboardContent() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let dbUser;
  try {
    dbUser = await ensureDbUser(userId);
  } catch {
    return (
      <div className="text-center text-red-400 py-10">
        Error loading user profile. Please try logging out and logging back in.
      </div>
    );
  }

  const [totalChecks, avgResult, historyRecords] = await Promise.all([
    prisma.grammarCheckHistory.count({ where: { userId: dbUser.id } }),
    prisma.grammarCheckHistory.aggregate({
      where: { userId: dbUser.id },
      _avg: { score: true },
    }),
    prisma.grammarCheckHistory.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const avgScore = avgResult._avg.score ? Math.round(avgResult._avg.score) : 0;

  const activeStreak = getActiveStreak(dbUser.lastPracticeAt, dbUser.streakCount);

  const chartData = historyRecords
    .slice(0, 20)
    .reverse()
    .map((h, i) => ({
      name: `Check ${i + 1}`,
      score: h.score || 0,
    }));

  return (
    <PageContainer>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
        title={`Welcome back, ${dbUser.name}`}
        description="Track your English learning progress over time."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="text-center py-4 sm:py-6">
          <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Avg Score</p>
          <p className="text-4xl font-bold text-purple-400">{avgScore}</p>
        </Card>
        <Card className="text-center py-4 sm:py-6">
          <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Current Streak</p>
          <p className="text-4xl font-bold text-orange-400">{activeStreak} <span className="text-lg text-slate-500">Days</span></p>
        </Card>
        <Card className="text-center py-4 sm:py-6">
          <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Total Checks</p>
          <p className="text-4xl font-bold text-emerald-400">{totalChecks}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4 sm:mb-6">Grammar Score Trend</h2>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ProgressChart data={chartData} />
          </div>
        ) : (
          <div className="min-h-[300px] flex items-center justify-center text-slate-400">
            Complete a few grammar checks to see your progress.
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4 sm:mb-6">Recent History</h2>
        <div className="space-y-3">
          {historyRecords.slice(0, 10).map((h) => (
            <div key={h.id} className="bg-slate-950/50 p-3 sm:p-4 rounded-xl flex items-center justify-between border border-slate-800 gap-2">
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-medium text-slate-200 break-words">{h.originalText}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(h.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={(h.score || 0) >= 80 ? "success" : (h.score || 0) >= 60 ? "warning" : "error"} className="shrink-0">
                Score: {h.score || 0}
              </Badge>
            </div>
          ))}
          {historyRecords.length === 0 && (
            <p className="text-slate-500 text-center py-4">
              No history yet. Go to the Check tab to get started!
            </p>
          )}
        </div>
      </Card>
      </div>
    </PageContainer>
  );
}