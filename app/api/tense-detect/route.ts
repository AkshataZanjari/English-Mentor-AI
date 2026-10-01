import { NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";

const schema = {
  type: "object",
  properties: {
    tense: { type: "string" },
    explanation: { type: "string" },
    structure: { type: "string" },
    examples: { type: "array", items: { type: "string" } },
  },
};

export async function POST(req: Request) {
  const { sentence } = await req.json();
  const model = getModel(schema);
  const prompt = `Detect the tense of this sentence: "${sentence}". Explain simply why it is that tense, show the grammar structure, and give 2 more examples of the same tense.`;
  const result = await model.generateContent(prompt);
  return NextResponse.json(JSON.parse(result.response.text()));
}
