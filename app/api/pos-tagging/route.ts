import { NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";

const schema = {
  type: "object",
  properties: {
    words: {
      type: "array",
      items: {
        type: "object",
        properties: {
          word: { type: "string" },
          pos: { type: "string" },
        },
      },
    },
  },
};

export async function POST(req: Request) {
  const { sentence } = await req.json();
  const model = getModel(schema);
  const prompt = `Tag every word in this sentence with its part of speech (Noun, Verb, Adjective, Adverb, Pronoun, Possessive Pronoun, Preposition, Conjunction, Determiner, Interjection): "${sentence}"`;
  const result = await model.generateContent(prompt);
  return NextResponse.json(JSON.parse(result.response.text()));
}
