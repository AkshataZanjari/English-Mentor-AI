import { auth, currentUser } from "@clerk/nextjs/server";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import SafeRedirect from "@/components/SafeRedirect";
import { prisma } from "@/lib/prisma";
import ProgressChart from "@/components/ProgressChart";

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
    // Client SDK thinks we are signed in, but Server SDK couldn't validate the token.
    // This happens due to Clock Skew or stale Next.js router cache.
    // We cannot render <RedirectToSignIn /> here or it will crash Clerk React.
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-bold text-white">Syncing Session...</h2>
          <p className="text-white/70">
            We are securely syncing your authentication state. If this takes longer than a few seconds, please press F5 to refresh the page.
          </p>
        </div>
      </main>
    );
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      history: {
        orderBy: { createdAt: "desc" },
      },
    },
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
        include: { history: true },
      });
    } else {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
          <div className="glass-card p-8 max-w-md w-full text-center space-y-4 text-red-400">
            Error loading user profile. Please try logging out and logging back in.
          </div>
        </main>
      );
    }
  }

  const totalChecks = dbUser.history.length;
  const recentHistory = dbUser.history.slice(0, 5);

  const chartData = dbUser.history
    .slice()
    .reverse()
    .map((h, i) => ({
      name: `Check ${i + 1}`,
      score: (h as any).score || 0,
    }));

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold mb-8">
        Welcome back, <span className="text-purple-400">{dbUser.name}</span>!
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card p-6 rounded-2xl flex flex-col">
          <h2 className="text-2xl font-semibold mb-4 text-white/90">
            Grammar Score Over Time
          </h2>
          {chartData.length > 0 ? (
            <div className="flex-1 min-h-[250px]">
              <ProgressChart data={chartData} />
            </div>
          ) : (
            <div className="flex-1 min-h-[250px] flex items-center justify-center text-white/40">
              Complete a few grammar checks to see your progress.
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6 rounded-2xl space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-white/90 mb-2">🔥 Learning Streak</h2>
            <div className="text-5xl font-bold text-orange-400 my-4">
              {dbUser.streakCount} <span className="text-2xl text-white/60">Day{dbUser.streakCount !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-sm text-white/60">
              {dbUser.streakCount > 0 ? "Keep practicing to maintain your streak!" : "Complete a practice today to start your streak!"}
            </p>
            <div className="text-xs text-white/40 mt-4">
              Longest Streak: {dbUser.longestStreak}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-white/90">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-4 rounded-xl text-center">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Total Checks</p>
                <p className="text-2xl font-bold text-purple-400">{totalChecks}</p>
              </div>
              <div className="bg-black/20 p-4 rounded-xl text-center">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Avg Score</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {totalChecks > 0
                    ? Math.round(
                        dbUser.history.reduce((a, b) => a + (Number((b as any).score) || 0), 0) /
                          totalChecks
                      )
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-white/90">
          Recent Checks
        </h2>
        <div className="space-y-4">
          {recentHistory.map((h) => (
            <div
              key={h.id}
              className="bg-black/20 p-4 rounded-xl flex items-center justify-between hover:bg-black/30 transition-colors"
            >
              <div className="space-y-1 truncate pr-4">
                <p className="font-medium text-white/90 truncate">{h.originalText}</p>
                <p className="text-sm text-white/50">
                  {new Date(h.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4 shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    ((h as any).score || 0) >= 80
                      ? "bg-emerald-500/20 text-emerald-400"
                      : ((h as any).score || 0) >= 60
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  Score: {(h as any).score || 0}
                </span>
              </div>
            </div>
          ))}
          {recentHistory.length === 0 && (
            <p className="text-white/50 text-center py-4">
              No history yet. Go to the Grammar Checker to get started!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}