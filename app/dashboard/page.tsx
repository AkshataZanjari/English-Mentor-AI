import { auth, currentUser } from "@clerk/nextjs/server";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import SafeRedirect from "@/components/SafeRedirect";
import { prisma } from "@/lib/prisma";
import ProgressChart from "@/components/ProgressChart";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

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
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-2xl font-bold">Syncing Session...</h2>
      </div>
    );
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    const user = await currentUser();
    if (user) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.emailAddresses[0]?.emailAddress || "",
        },
      });
    } else {
      return (
        <div className="text-center text-red-400 py-10">
          Error loading user profile. Please try logging out and logging back in.
        </div>
      );
    }
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
  
  const chartData = historyRecords
    .slice(0, 20)
    .reverse()
    .map((h, i) => ({
      name: `Check ${i + 1}`,
      score: h.score || 0,
    }));

  return (
    <div className="space-y-8">
      <PageHeader 
        title={`Welcome back, ${dbUser.name}`}
        description="Track your English learning progress over time."
      />

      <div className="grid grid-cols-3 gap-6">
        <Card className="text-center py-6">
          <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Avg Score</p>
          <p className="text-4xl font-bold text-purple-400">{avgScore}</p>
        </Card>
        <Card className="text-center py-6">
          <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Current Streak</p>
          <p className="text-4xl font-bold text-orange-400">{dbUser.streakCount} <span className="text-lg text-slate-500">Days</span></p>
        </Card>
        <Card className="text-center py-6">
          <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Total Checks</p>
          <p className="text-4xl font-bold text-emerald-400">{totalChecks}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Grammar Score Trend</h2>
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

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Recent History</h2>
        <div className="space-y-3">
          {historyRecords.slice(0, 10).map((h) => (
            <div key={h.id} className="bg-slate-950/50 p-4 rounded-xl flex items-center justify-between border border-slate-800">
              <div className="truncate pr-4">
                <p className="font-medium text-slate-200 truncate">{h.originalText}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(h.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={(h.score || 0) >= 80 ? "success" : (h.score || 0) >= 60 ? "warning" : "error"}>
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
  );
}