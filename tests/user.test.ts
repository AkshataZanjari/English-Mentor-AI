import { describe, it, expect } from "vitest";
import { displayName } from "../lib/auth/user";

describe("displayName", () => {
  it("should return name if present", () => {
    expect(displayName({ name: "Alice", email: "alice@example.com" })).toBe("Alice");
    expect(displayName({ name: " Bob " })).toBe(" Bob ");
  });

  it("should fallback to email prefix if name is missing or empty", () => {
    expect(displayName({ name: "", email: "bob@example.com" })).toBe("bob");
    expect(displayName({ name: null, email: "charlie@test.com" })).toBe("charlie");
    expect(displayName({ email: "dave.smith@test.com" })).toBe("dave.smith");
  });

  it("should fallback to 'there' if both are missing or invalid", () => {
    expect(displayName({ name: null, email: null })).toBe("there");
    expect(displayName({})).toBe("there");
    expect(displayName({ name: "   ", email: "invalid-email" })).toBe("there");
  });
});
