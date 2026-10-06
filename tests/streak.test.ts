import { describe, it, expect } from "vitest";
import { calculateNewStreak } from "../lib/streak";

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
});
