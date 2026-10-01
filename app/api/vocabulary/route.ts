import { NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";

const schema = {
  type: "object",
  properties: {
    alternatives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          word: { type: "string" },
          meaning: { type: "string" },
          usageExample: { type: "string" },
        },
      },
    },
  },
};

export async function POST(req: Request) {
  const { sentence } = await req.json();
  const model = getModel(schema);
  const prompt = `Suggest 3 more advanced/natural vocabulary alternatives for the key word/phrase in this sentence: "${sentence}". Give meaning and a usage example for each.`;
  const result = await model.generateContent(prompt);
  return NextResponse.json(JSON.parse(result.response.text()));
}
