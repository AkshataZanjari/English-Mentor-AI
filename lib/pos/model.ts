import { generateObject, generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const model = google("gemini-3.5-flash-lite");

export async function generateStructured<T>({
  system,
  prompt,
  schema,
  timeoutMs = 15000,
}: {
  system?: string;
  prompt: string;
  schema: z.ZodSchema<T>;
  timeoutMs?: number;
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error("AI response timed out")), timeoutMs);

  try {
    const result = await generateObject({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: model as any,
      system,
      prompt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schema: schema as any,
      abortSignal: controller.signal,
    });

    return result.object;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generatePlainText({
  system,
  prompt,
  timeoutMs = 15000,
}: {
  system?: string;
  prompt: string;
  timeoutMs?: number;
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error("AI response timed out")), timeoutMs);

  try {
    const result = await generateText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: model as any,
      system,
      prompt,
      abortSignal: controller.signal,
    });

    return result.text;
  } finally {
    clearTimeout(timeoutId);
  }
}