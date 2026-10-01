import {
  rewriteBodySchema,
  scenarioReportSchema,
  scenarioTurnSchema,
} from "@/lib/pos/schemas";
import { buildRewritePrompt } from "@/lib/pos/prompts";
import { generatePlainText } from "@/lib/pos/model";
import { fail, ok } from "@/lib/pos/response";
import { safeJsonParse } from "@/lib/pos/parser";

function looksLikeScenarioTurnPrompt(text: string) {
  return (
    text.includes("assistantReply") &&
    text.includes("naturalAlternative") &&
    text.includes("feedback")
  );
}

function looksLikeScenarioReportPrompt(text: string) {
  return (
    text.includes("mistakesSummary") &&
    text.includes("betterPhrases") &&
    text.includes("toneScore")
  );
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = rewriteBodySchema.parse(json);

    if (looksLikeScenarioTurnPrompt(body.text)) {
      const raw = await generatePlainText({
        prompt: body.text,
      });

      const parsed = safeJsonParse(raw, scenarioTurnSchema);

      if (!parsed.ok) {
        return fail(`Scenario parser error: ${parsed.error}`, 500);
      }

      return ok({
        result: JSON.stringify(parsed.data),
      });
    }

    if (looksLikeScenarioReportPrompt(body.text)) {
      const raw = await generatePlainText({
        prompt: body.text,
      });

      const parsed = safeJsonParse(raw, scenarioReportSchema);

      if (!parsed.ok) {
        return fail(`Scenario report parser error: ${parsed.error}`, 500);
      }

      return ok({
        result: JSON.stringify(parsed.data),
      });
    }

    const rewritten = await generatePlainText({
      prompt: buildRewritePrompt(body.text, body.tone ?? "formal"),
    });

    return ok({
      result: rewritten.trim(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to rewrite text";
    return fail(message, 400);
  }
}