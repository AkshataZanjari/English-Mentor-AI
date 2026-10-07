import { describe, it, expect } from "vitest";
import { findCorrectedUserMessage, shouldShowCorrection } from "../lib/pos/roleplay";

describe("roleplay correction logic", () => {
  it("should find the last user message before the assistant index", () => {
    const messages = [
      { role: "assistant", text: "Hello" },
      { role: "user", text: "Hi" },
      { role: "assistant", text: "How are you?" }, // index 2
      { role: "user", text: "I is good" },         // index 3
      { role: "assistant", text: "I am good." },   // index 4
    ];

    expect(findCorrectedUserMessage(messages, 4)).toBe("I is good");
    expect(findCorrectedUserMessage(messages, 2)).toBe("Hi");
  });

  it("should handle 3 user turns in a row (regression)", () => {
    const messages = [
      { role: "user", text: "One" },
      { role: "user", text: "Two" },
      { role: "user", text: "Three" },
      { role: "assistant", text: "Four" }, // index 3
    ];
    // Assistant message at index 3 corrects the most recent user message (index 2)
    expect(findCorrectedUserMessage(messages, 3)).toBe("Three");
  });

  it("should return null if no previous user message exists", () => {
    const messages = [
      { role: "assistant", text: "Hello" }, // index 0
    ];
    expect(findCorrectedUserMessage(messages, 0)).toBeNull();
  });

  describe("shouldShowCorrection", () => {
    it("should return false if correction matches user text exactly", () => {
      const messages = [
        { role: "user", text: "I am fine" },
        { role: "assistant", text: "Great" }
      ];
      expect(shouldShowCorrection("I am fine", messages, 1)).toBe(false);
    });

    it("should return true if correction differs", () => {
      const messages = [
        { role: "user", text: "I is fine" },
        { role: "assistant", text: "Great" }
      ];
      expect(shouldShowCorrection("I am fine", messages, 1)).toBe(true);
    });

    it("should handle whitespace differences", () => {
      const messages = [
        { role: "user", text: " I am fine " },
        { role: "assistant", text: "Great" }
      ];
      expect(shouldShowCorrection("I am fine", messages, 1)).toBe(false);
    });
  });
});
