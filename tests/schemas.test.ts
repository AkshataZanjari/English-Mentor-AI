import { describe, it, expect } from "vitest";
import { checkBodySchema, rewriteBodySchema } from "../lib/pos/schemas";

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

    // @ts-expect-error testing invalid tone
    const resultFormal = rewriteBodySchema.safeParse({ text: "Hi", tone: "formal" });
    expect(resultFormal.success).toBe(false);

    // @ts-expect-error testing invalid tone
    const resultFriendly = rewriteBodySchema.safeParse({ text: "Hi", tone: "friendly" });
    expect(resultFriendly.success).toBe(false);
  });
});
