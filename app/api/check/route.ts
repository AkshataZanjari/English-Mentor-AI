import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";

const schema = {
  type: "object",
  properties: {
    result: { type: "string" },
  },
  required: ["result"],
};

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ result: "Please enter some text." }, { status: 400 });
    }

    const model = getModel(schema);

    const prompt = `Check the grammar, spelling, and punctuation of the following text. Correct any mistakes and return the corrected version. If it is already correct, return it unchanged.

Text: "${text}"

Respond only with JSON: { "result": "corrected text here" }`;

    const response = await model.generateContent(prompt);
    const raw = response.response.text();
    const parsed = JSON.parse(raw);

    return NextResponse.json({ result: parsed.result });
  } catch (error) {
    console.error("Check route error:", error);
    return NextResponse.json(
      { result: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}