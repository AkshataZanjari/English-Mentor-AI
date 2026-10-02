import { auth } from "@clerk/nextjs/server";
import { replyBodySchema, replyResultSchema } from "@/lib/pos/schemas";
import { buildReplyPrompt } from "@/lib/pos/prompts";
import { generateStructured } from "@/lib/pos/model";
import { fail, ok } from "@/lib/pos/response";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return fail("Unauthorized", 401);
    }

    const json = await req.json();
    const body = replyBodySchema.parse(json);

    const data = (await generateStructured({
      prompt: buildReplyPrompt(body.message, body.draftReply),
      schema: replyResultSchema,
    })) as { suggestions: string[]; improvedReply: string };

    return ok({
      suggestions: data.suggestions.slice(0, 2),
      improvedReply: data.improvedReply || "",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate replies";
    return fail(message, 400);
  }
}