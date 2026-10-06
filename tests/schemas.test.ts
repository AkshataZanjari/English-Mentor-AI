import { describe, it, expect } from "vitest";
import { checkBodySchema, rewriteBodySchema, roleplayBodySchema } from "../lib/pos/schemas";

describe("checkBodySchema", () => {
  it("should validate a correct payload", () => {
    const result = checkBodySchema.safeParse({ text: "Hello world" });
    expect(result.success).toBe(true);
  });

  it("should reject an empty text", () => {
    const result = checkBodySchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });

  it("should reject extremely long text", () => {
    const longText = "a".repeat(1500);
    const result = checkBodySchema.safeParse({ text: longText });
    expect(result.success).toBe(false);
  });
});

describe("rewriteBodySchema", () => {
  it("should validate tone enum", () => {
    const resultProfessional = rewriteBodySchema.safeParse({ text: "Hi", tone: "professional" });
    expect(resultProfessional.success).toBe(true);

    const resultInvalid = rewriteBodySchema.safeParse({ text: "Hi", tone: "invalid_tone" });
    expect(resultInvalid.success).toBe(false);

    const resultFormal = rewriteBodySchema.safeParse({ text: "Hi", tone: "formal" });
    expect(resultFormal.success).toBe(false);

    const resultFriendly = rewriteBodySchema.safeParse({ text: "Hi", tone: "friendly" });
    expect(resultFriendly.success).toBe(false);
  });

  it("should reject extremely long text over 1000", () => {
    const longText = "a".repeat(1001);
    const result = rewriteBodySchema.safeParse({ text: longText });
    expect(result.success).toBe(false);
  });
});

describe("roleplayBodySchema", () => {
  it("should validate a valid body", () => {
    const result = roleplayBodySchema.safeParse({
      scenarioId: "hr-interview",
      action: "turn",
      messages: [{ role: "user", text: "Hi" }]
    });
    expect(result.success).toBe(true);
  });

  it("should reject an unknown scenarioId", () => {
    const result = roleplayBodySchema.safeParse({
      scenarioId: "unknown-scenario",
      action: "turn",
      messages: [{ role: "user", text: "Hi" }]
    });
    expect(result.success).toBe(false);
  });

  it("should reject more than 30 messages", () => {
    const messages = Array.from({ length: 31 }).map(() => ({ role: "user", text: "Hi" }));
    const result = roleplayBodySchema.safeParse({
      scenarioId: "hr-interview",
      action: "turn",
      messages
    });
    expect(result.success).toBe(false);
  });

  it("should reject a message over 1000 characters", () => {
    const result = roleplayBodySchema.safeParse({
      scenarioId: "hr-interview",
      action: "turn",
      messages: [{ role: "user", text: "a".repeat(1001) }]
    });
    expect(result.success).toBe(false);
  });
});
