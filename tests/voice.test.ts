import { describe, it, expect } from "vitest";
import { joinTranscriptSegments } from "../lib/voice";

describe("joinTranscriptSegments", () => {
  it("should add a space when neither side has whitespace", () => {
    expect(joinTranscriptSegments("Hello", "world")).toBe("Hello world");
  });

  it("should not add a space if the existing text ends with a space", () => {
    expect(joinTranscriptSegments("Hello ", "world")).toBe("Hello world");
  });

  it("should not add a space if the incoming text starts with a space", () => {
    expect(joinTranscriptSegments("Hello", " world")).toBe("Hello world");
  });

  it("should handle empty strings", () => {
    expect(joinTranscriptSegments("", "world")).toBe("world");
    expect(joinTranscriptSegments("Hello", "")).toBe("Hello");
    expect(joinTranscriptSegments("", "")).toBe("");
  });
});
