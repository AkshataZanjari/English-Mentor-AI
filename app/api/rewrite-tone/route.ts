import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sentence = String(body?.sentence || "").trim();
    const tone = String(body?.tone || "").trim().toLowerCase();

    if (!sentence) {
      return NextResponse.json(
        { error: "Sentence is required" },
        { status: 400 }
      );
    }

    if (!["genz", "formal"].includes(tone)) {
      return NextResponse.json(
        { error: "Invalid tone" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in .env" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.5,
      },
    });

    const prompt = `
You are an English tone rewriter.

Rewrite the user's sentence in the requested tone while keeping the original meaning.

Input sentence:
"${sentence}"

Target tone:
"${tone}"

Allowed tones:
- genz
- formal

Tone rules:
- genz: casual, current, youth-style, light internet tone, but still clear and readable; use at most 1 mild slangy phrasing if it fits naturally; do not overdo slang; do not make it cringey; do not change the meaning.
- formal: polite, polished, professional English; slightly more complete wording is allowed, but keep the same meaning.

General rules:
- Preserve the original intent and factual meaning exactly.
- Do not add new information.
- Fix grammar, punctuation, and capitalization when needed.
- Keep the sentence length close to the original unless a small change improves correctness.
- If the input is already good, still rewrite it lightly to match the requested tone.
- Avoid extreme slang such as "fr", "no cap", "bussin", or "lowkey" unless the input already has that style.
- Return JSON only.
- Do not use markdown.
- Do not include any explanation.

Return JSON in this exact format:
{
  "tone": "genz",
  "rewrittenSentence": "Hey, you coming tonight?"
}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    let data: any;

    try {
      data = JSON.parse(raw);
    } catch {
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      try {
        data = JSON.parse(cleaned);
      } catch {
        data = {
          tone,
          rewrittenSentence: sentence,
        };
      }
    }

    const rewrittenSentence =
      typeof data?.rewrittenSentence === "string" &&
      data.rewrittenSentence.trim()
        ? data.rewrittenSentence.trim()
        : sentence;

    return NextResponse.json({
      tone: data?.tone === "genz" || data?.tone === "formal" ? data.tone : tone,
      rewrittenSentence,
    });
  } catch (err: any) {
    console.error("Rewrite tone API error:", err);

    const message = String(err?.message || "");

    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      return NextResponse.json(
        { error: "AI limit reached. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to rewrite sentence" },
      { status: 500 }
    );
  }
}