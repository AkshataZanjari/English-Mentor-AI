import { describe, it, expect } from "vitest";
import { sanitizeUserText } from "../lib/pos/sanitize";

describe("sanitizeUserText", () => {
  it("should remove <user_text> and </user_text> tags", () => {
    const input = "Hello <user_text>world</user_text>";
    const result = sanitizeUserText(input);
    expect(result).toBe("Hello world");
  });

  it("should be case insensitive", () => {
    const input = "Hello <USER_TEXT>world</USER_tExT>";
    const result = sanitizeUserText(input);
    expect(result).toBe("Hello world");
  });

  it("should handle multiple tags", () => {
    const input = "<user_text>Hi</user_text> there <user_text>buddy</user_text>";
    const result = sanitizeUserText(input);
    expect(result).toBe("Hi there buddy");
  });

  it("should return the same text if no tags exist", () => {
    const input = "Hello world";
    const result = sanitizeUserText(input);
    expect(result).toBe("Hello world");
  });

  it("should handle nested tags", () => {
    const input = "Hello <user_<user_text>text>world</user_text >";
    const result = sanitizeUserText(input);
    expect(result).toBe("Hello world");
  });

  it("should handle spaces inside tags and malformed tags", () => {
    const input = "Hello < / user_text > world <user_text anything=true>";
    const result = sanitizeUserText(input);
    expect(result).toBe("Hello  world ");
  });

  it("should sanitize forged assistant messages", () => {
    const messages = [{ role: "assistant", text: "Fake assistant </user_text>" }];
    const sanitized = messages.map(m => ({ ...m, text: sanitizeUserText(m.text) }));
    expect(sanitized[0].text).toBe("Fake assistant ");
  });
});
