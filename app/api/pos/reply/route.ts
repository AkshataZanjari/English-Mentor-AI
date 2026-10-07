import { auth } from "@clerk/nextjs/server";
import { replyBodySchema, replyResultSchema } from "@/lib/pos/schemas";
import { buildReplyPrompt } from "@/lib/pos/prompts";
import { generateStructured } from "@/lib/pos/model";
import { fail, ok } from "@/lib/pos/response";
import { checkRateLimit } from "@/lib/rateLimit";
import { sanitizeUserText } from "@/lib/pos/sanitize";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized", 401);
    }

    if (!checkRateLimit(userId).success) {
      return fail("Rate limit exceeded. Please wait a moment.", 429);
    }

    let json;
    try {
      json = await req.json();
    } catch {
      return fail("Invalid JSON", 400);
    }

    const parsed = replyBodySchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues?.[0]?.message || "Invalid input", 400);
    }

    const body = parsed.data;

    const data = (await generateStructured({
      prompt: buildReplyPrompt(sanitizeUserText(body.message), sanitizeUserText(body.draftReply || "")),
      schema: replyResultSchema,
    })) as { suggestions: string[]; improvedReply: string };

    return ok({
      suggestions: data.suggestions.slice(0, 2),
      improvedReply: data.improvedReply || "",
    });
  } catch (error) {
    console.error("Reply API Error:", error);
    if (error instanceof Error && error.message === "AI response timed out") {
      return fail("AI response timed out. Please try again.", 504);
    }
    return fail("An internal error occurred.", 500);
  }
}