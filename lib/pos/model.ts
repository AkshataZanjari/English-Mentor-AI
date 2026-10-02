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
}: {
  system?: string;
  prompt: string;
  schema: z.ZodSchema<T>;
}) {
  const result = await generateObject({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: model as any,
    system,
    prompt,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: schema as any,
  });

  return result.object;
}

export async function generatePlainText({
  system,
  prompt,
}: {
  system?: string;
  prompt: string;
}) {
  const result = await generateText({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: model as any,
    system,
    prompt,
  });

  return result.text;
}