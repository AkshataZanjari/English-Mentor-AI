import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit } from "../lib/rateLimit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should allow up to the limit, block the next, and reset after window", () => {
    const key = "test-user-123";
    const RATE_LIMIT = 20;

    // First 20 should succeed
    for (let i = 0; i < RATE_LIMIT; i++) {
      expect(checkRateLimit(key).success).toBe(true);
    }

    // 21st should fail
    expect(checkRateLimit(key).success).toBe(false);

    // Fast forward 61 seconds (WINDOW_MS is 60000)
    vi.advanceTimersByTime(61000);

    // Should succeed again
    expect(checkRateLimit(key).success).toBe(true);
  });
});
