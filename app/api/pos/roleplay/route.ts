import { auth } from "@clerk/nextjs/server";
import { roleplayBodySchema, scenarioTurnSchema, scenarioReportSchema } from "@/lib/pos/schemas";
import { buildScenarioTurnPrompt, buildScenarioReportPrompt } from "@/lib/pos/scenarios";
import { checkRateLimit } from "@/lib/rateLimit";
import { sanitizeUserText } from "@/lib/pos/sanitize";
import { ok, fail } from "@/lib/pos/response";
import { generatePlainText } from "@/lib/pos/model";
import { safeJsonParse } from "@/lib/pos/parser";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    if (!userId) {
      return fail("Unauthorized", 401);
    }

    const rateLimitCheck = checkRateLimit(userId);
    if (!rateLimitCheck.success) {
      return fail("Rate limit exceeded. Please wait a moment.", 429);
    }

    let json;
    try {
      json = await req.json();
    } catch {
      return fail("Invalid JSON", 400);
    }

    const parsed = roleplayBodySchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues?.[0]?.message || "Invalid input", 400);
    }

    const body = parsed.data;

    // Sanitize user input in messages
    const sanitizedMessages = body.messages.map((m) => ({
      ...m,
      text: m.role === "user" ? sanitizeUserText(m.text) : m.text,
    }));

    let prompt = "";
    if (body.action === "turn") {
      prompt = buildScenarioTurnPrompt(body.scenarioId as import("@/app/pos/config").ScenarioId, sanitizedMessages as { role: "user" | "assistant"; text: string }[]);
    } else {
      prompt = buildScenarioReportPrompt(body.scenarioId as import("@/app/pos/config").ScenarioId, sanitizedMessages as { role: "user" | "assistant"; text: string }[]);
    }

    // Call Gemini
    const resultText = await generatePlainText({ prompt });

    if (body.action === "turn") {
      const parsedData = safeJsonParse(resultText, scenarioTurnSchema);
      if (!parsedData.ok) {
        console.error("Gemini output parsing failed", parsedData.error);
        return fail("Failed to parse AI output.", 500);
      }
      return ok(parsedData.data);
    } else {
      const parsedData = safeJsonParse(resultText, scenarioReportSchema);
      if (!parsedData.ok) {
        console.error("Gemini output parsing failed", parsedData.error);
        return fail("Failed to parse AI output.", 500);
      }
      return ok(parsedData.data);
    }

  } catch (err: unknown) {
    console.error("Roleplay API Error:", err);
    return fail("An internal error occurred.", 500);
  }
}
