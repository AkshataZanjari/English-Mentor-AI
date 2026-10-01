import { checkBodySchema, checkResultSchema } from "@/lib/pos/schemas";
import { buildCheckPrompt } from "@/lib/pos/prompts";
import { generateStructured } from "@/lib/pos/model";
import { fail, ok } from "@/lib/pos/response";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = checkBodySchema.parse(json);

    const data: any = await generateStructured({
      prompt: buildCheckPrompt(body.text),
      schema: checkResultSchema,
    });

    return ok(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to check text";
    return fail(message, 400);
  }
}