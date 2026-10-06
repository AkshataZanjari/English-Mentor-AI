export function calculateNewStreak(
  lastPracticeAt: Date | null,
  currentStreak: number,
  longestStreak: number,
  now: Date = new Date()
): { newStreak: number; newLongest: number } {
  let newStreak = currentStreak;
  let newLongest = longestStreak;

  if (!lastPracticeAt) {
    newStreak = 1;
  } else {
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const lastDate = new Date(
      Date.UTC(lastPracticeAt.getUTCFullYear(), lastPracticeAt.getUTCMonth(), lastPracticeAt.getUTCDate())
    );
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  if (newStreak > newLongest) {
    newLongest = newStreak;
  }

  return { newStreak, newLongest };
}
