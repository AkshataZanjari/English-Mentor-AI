import { describe, it, expect } from "vitest";
import { calculateNewStreak, resolveTimeZone } from "../lib/streak";

describe("calculateNewStreak", () => {
  it("should start a new streak if lastPracticeAt is null", () => {
    const { newStreak, newLongest } = calculateNewStreak(null, 0, 0);
    expect(newStreak).toBe(1);
    expect(newLongest).toBe(1);
  });

  it("should increment streak if practiced yesterday", () => {
    const now = new Date("2026-10-06T12:00:00Z");
    const lastPractice = new Date("2026-10-05T15:00:00Z");

    const { newStreak, newLongest } = calculateNewStreak(lastPractice, 1, 1, now);

    expect(newStreak).toBe(2);
    expect(newLongest).toBe(2);
  });

  it("should reset streak if practiced 2 days ago", () => {
    const now = new Date("2026-10-06T12:00:00Z");
    const lastPractice = new Date("2026-10-04T15:00:00Z");

    const { newStreak, newLongest } = calculateNewStreak(lastPractice, 5, 5, now);

    expect(newStreak).toBe(1);
    expect(newLongest).toBe(5); // longest is preserved
  });

  it("should not increment if already practiced today", () => {
    const now = new Date("2026-10-06T20:00:00Z");
    const lastPractice = new Date("2026-10-06T10:00:00Z");

    const { newStreak, newLongest } = calculateNewStreak(lastPractice, 3, 5, now);

    expect(newStreak).toBe(3);
    expect(newLongest).toBe(5);
  });
  it("should handle same IST day correctly in Asia/Kolkata timezone", () => {
    // 2:00 AM IST and 8:00 AM IST on the same day must NOT count as two separate days
    const date1 = new Date("2026-10-10T02:00:00+05:30"); // earlier practice
    const date2 = new Date("2026-10-10T08:00:00+05:30"); // later practice

    const { newStreak } = calculateNewStreak(date1, 1, 1, date2, "Asia/Kolkata");
    expect(newStreak).toBe(1); // Still streak 1 (no increment)
  });

  it("should handle consecutive IST days correctly across UTC midnight in Asia/Kolkata timezone", () => {
    // 11:30 PM IST followed by 4:00 AM IST the next day MUST count as consecutive days
    const date3 = new Date("2026-10-10T23:30:00+05:30"); // Oct 10 IST (Oct 10 18:00 UTC)
    const date4 = new Date("2026-10-11T04:00:00+05:30"); // Oct 11 IST (Oct 10 22:30 UTC)

    // In UTC these are the same day (Oct 10). In Asia/Kolkata they are consecutive days (Oct 10 -> Oct 11).
    const { newStreak } = calculateNewStreak(date3, 1, 1, date4, "Asia/Kolkata");
    expect(newStreak).toBe(2); // Consecutive day (incremented)
  });
});

describe("resolveTimeZone", () => {
  it("should return the given timezone if valid", () => {
    expect(resolveTimeZone("Asia/Kolkata")).toBe("Asia/Kolkata");
    expect(resolveTimeZone("America/New_York")).toBe("America/New_York");
  });

  it("should fallback to UTC for invalid timezones", () => {
    expect(resolveTimeZone("Invalid/Zone")).toBe("UTC");
    expect(resolveTimeZone("")).toBe("UTC");
    expect(resolveTimeZone(undefined)).toBe("UTC");
  });

  it("should handle IST same-day correctly", () => {
    // Both times are the same day in IST
    const lastPractice = new Date("2023-01-01T21:00:00Z"); // 1st Jan 21:00 UTC = 2nd Jan 02:30 IST
    const now = new Date("2023-01-02T10:00:00Z"); // 2nd Jan 10:00 UTC = 2nd Jan 15:30 IST

    const tz = resolveTimeZone("Asia/Kolkata");
    const { newStreak } = calculateNewStreak(lastPractice, 1, 1, now, tz);

    // In IST, they are the same day (2nd Jan), so streak should not increment
    expect(newStreak).toBe(1);
  });
});
