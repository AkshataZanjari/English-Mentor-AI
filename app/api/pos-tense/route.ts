import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sentence = String(body?.sentence || "").trim();

    if (!sentence) {
      return NextResponse.json(
        { error: "Sentence is required" },
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
        temperature: 0.2,
      },
    });

    const prompt = `
You are an English grammar teacher and writing assistant.

Analyze this sentence:
"${sentence}"

Return only valid JSON in this exact format:
{
  "tokens": [
    {
      "word": "She",
      "tag": "Pronoun",
      "explanation": "Used instead of a noun."
    }
  ],
  "tense": {
    "tense": "Simple Present",
    "explanation": "This tense shows a regular action or fact.",
    "structure": "Subject + base verb / verb-s",
    "example": "She goes to college."
  },
  "grammarStatus": "correct",
  "writingNote": "Capitalize the first word.",
  "correctedSentence": "She goes to college.",
  "mainIssue": "",
  "isGrammarCorrect": true,
  "spellingStatus": "correct",
  "betterWord": "",
  "betterWordReason": ""
}

Rules:
- Preserve original word casing exactly as written in tokens.
- Tokenize the sentence word by word.
- Use simple tag names only: Noun, Pronoun, Verb, Adjective, Adverb, Preposition, Conjunction, Article, Other.
- Keep explanations short and beginner-friendly.
- Detect the main tense of the sentence.
- grammarStatus must be only: correct or incorrect.
- spellingStatus must be only: correct or incorrect.
- writingNote should be used for capitalization, punctuation, spacing, or writing polish issues.
- mainIssue should be used only for real grammar issues.
- If grammar is correct but capitalization/punctuation is wrong, set isGrammarCorrect to true.
- If grammar is wrong, set isGrammarCorrect to false.
- If there is no writing note, return an empty string.
- If there is no grammar issue, return mainIssue as an empty string.
- correctedSentence should be the best corrected version.
- betterWord should contain only one best spelling or vocabulary improvement only.
- betterWordReason should explain why in short.
- If there is no better word suggestion, return empty strings for betterWord and betterWordReason.
- Return JSON only, no markdown.
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    let data: any;

    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        tokens: sentence.split(" ").map((word) => ({
          word,
          tag: "Other",
          explanation: "Basic word token.",
        })),
        tense: {
          tense: "Unknown",
          explanation: "Could not detect tense.",
          structure: "Unknown",
          example: "Unknown",
        },
        grammarStatus: "incorrect",
        writingNote: "",
        correctedSentence: sentence,
        mainIssue: "Could not analyze.",
        isGrammarCorrect: false,
        spellingStatus: "correct",
        betterWord: "",
        betterWordReason: "",
      };
    }

    return NextResponse.json({
      tokens: Array.isArray(data.tokens) ? data.tokens : [],
      tense: data.tense || {
        tense: "Unknown",
        explanation: "Could not detect tense.",
        structure: "Unknown",
        example: "Unknown",
      },
      grammarStatus:
        data.grammarStatus === "correct" || data.grammarStatus === "incorrect"
          ? data.grammarStatus
          : "incorrect",
      writingNote:
        typeof data.writingNote === "string" ? data.writingNote.trim() : "",
      correctedSentence:
        typeof data.correctedSentence === "string" && data.correctedSentence.trim()
          ? data.correctedSentence.trim()
          : sentence,
      mainIssue:
        typeof data.mainIssue === "string" ? data.mainIssue.trim() : "",
      isGrammarCorrect: Boolean(data.isGrammarCorrect),
      spellingStatus:
        data.spellingStatus === "correct" || data.spellingStatus === "incorrect"
          ? data.spellingStatus
          : "correct",
      betterWord:
        typeof data.betterWord === "string" ? data.betterWord.trim() : "",
      betterWordReason:
        typeof data.betterWordReason === "string"
          ? data.betterWordReason.trim()
          : "",
    });
  } catch (err: any) {
    console.error("POS/Tense API error:", err);

    const message = String(err?.message || "");

    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      return NextResponse.json(
        { error: "AI limit reached. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze sentence" },
      { status: 500 }
    );
  }
}