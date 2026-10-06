import { auth } from "@clerk/nextjs/server";
import { rewriteBodySchema } from "@/lib/pos/schemas";
import { buildRewritePrompt } from "@/lib/pos/prompts";
import { generatePlainText } from "@/lib/pos/model";
import { fail, ok } from "@/lib/pos/response";
import { checkRateLimit } from "@/lib/rateLimit";
import { sanitizeUserText } from "@/lib/pos/sanitize";

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

    const parsed = rewriteBodySchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues?.[0]?.message || "Invalid input", 400);
    }

    const body = parsed.data;

    const rewritten = await generatePlainText({
      prompt: buildRewritePrompt(sanitizeUserText(body.text), body.tone ?? "professional"),
    });

    return ok({
      result: rewritten.trim(),
    });
  } catch (error) {
    console.error("Rewrite API Error:", error);
    return fail("An internal error occurred.", 500);
  }
}