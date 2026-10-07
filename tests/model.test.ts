import { describe, it, expect, vi } from "vitest";
import { generatePlainText } from "../lib/pos/model";

// Mock the AI SDK
vi.mock("ai", () => ({
  generateText: async ({ abortSignal }: { abortSignal: AbortSignal }) => {
    return new Promise((resolve, reject) => {
      const onAbort = () => {
        reject(new Error("AI response timed out"));
      };
      
      if (abortSignal.aborted) {
        onAbort();
      } else {
        abortSignal.addEventListener("abort", onAbort);
      }
      
      // Simulate a long-running AI generation that will never finish in time
      setTimeout(() => {
        resolve({ text: "Simulated response" });
      }, 5000);
    });
  },
  generateObject: async () => ({ object: {} }),
}));

describe("AI Model Generation", () => {
  it("should timeout if the response takes longer than timeoutMs", async () => {
    // Expect the promise to reject due to our AbortController triggering
    await expect(
      generatePlainText({
        prompt: "Hello",
        timeoutMs: 50,
      })
    ).rejects.toThrowError("AI response timed out");
  });
});
