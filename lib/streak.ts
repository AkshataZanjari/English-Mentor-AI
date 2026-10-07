function getStartOfDayInTimeZone(date: Date, timeZone: string): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === 'year')!.value, 10);
  const month = parseInt(parts.find(p => p.type === 'month')!.value, 10) - 1;
  const day = parseInt(parts.find(p => p.type === 'day')!.value, 10);

  return new Date(Date.UTC(year, month, day));
}

export function resolveTimeZone(tz?: string | null, fallback: string = 'UTC'): string {
  if (!tz) return fallback;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    return fallback;
  }
}

export function calculateNewStreak(
  lastPracticeAt: Date | null,
  currentStreak: number,
  longestStreak: number,
  now: Date = new Date(),
  timeZone: string = 'UTC'
): { newStreak: number; newLongest: number } {
  let newStreak = currentStreak;
  let newLongest = longestStreak;

  if (!lastPracticeAt) {
    newStreak = 1;
  } else {
    const today = getStartOfDayInTimeZone(now, timeZone);
    const lastDate = getStartOfDayInTimeZone(lastPracticeAt, timeZone);
    const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

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

export function getActiveStreak(
  lastPracticeAt: Date | null,
  currentStreak: number,
  now: Date = new Date(),
  timeZone: string = 'UTC'
): number {
  if (!lastPracticeAt || currentStreak === 0) return 0;

  const today = getStartOfDayInTimeZone(now, timeZone);
  const lastDate = getStartOfDayInTimeZone(lastPracticeAt, timeZone);
  const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    return 0; // Streak lapsed
  }
  return currentStreak;
}
