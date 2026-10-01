import { z } from "zod";

function cleanJsonLikeText(input: string) {
  return input
    .replace(/```json/gi, "```")
    .replace(/```/g, "")
    .trim();
}

function extractFirstJsonObject(input: string) {
  const text = cleanJsonLikeText(input);

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return text.slice(firstBrace, lastBrace + 1);
}

export function parseStructuredObject<T>(
  raw: string,
  schema: z.ZodSchema<T>
): T {
  const attempts: string[] = [];

  const cleaned = cleanJsonLikeText(raw);
  attempts.push(cleaned);

  const extracted = extractFirstJsonObject(raw);
  if (extracted && extracted !== cleaned) {
    attempts.push(extracted);
  }

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate);
      return schema.parse(parsed);
    } catch {
      continue;
    }
  }

  throw new Error("Could not parse model output into valid JSON.");
}

export function safeJsonParse<T>(
  raw: string,
  schema: z.ZodSchema<T>
): { ok: true; data: T } | { ok: false; error: string } {
  try {
    const data = parseStructuredObject(raw, schema);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown parse error",
    };
  }
}