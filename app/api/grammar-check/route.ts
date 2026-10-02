import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const sentenceSchema = z.string().min(1).max(1000);

// Basic in-memory rate limiter
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // max requests per minute
const WINDOW_MS = 60 * 1000;
function fallbackGrammar(sentence: string) {
  // A safe default fallback if the AI response cannot be parsed
  return {
    isCorrect: false,
    correctedSentence: sentence,
    mistakes: ["Unable to analyze grammar at the moment. Please try again later."],
    explanation: "Our AI service encountered an error and could not analyze this sentence.",
    rule: "System Error",
    difficulty: "Unknown",
    similarExamples: [],
    practiceQuestion: "",
    practiceAnswer: "",
    score: 0,
    scoreExplanation: "No score generated due to an AI error.",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let sentence = "";
    try {
      sentence = sentenceSchema.parse(String(body?.sentence || "").trim());
    } catch (e) {
      return NextResponse.json(
        { error: "Sentence must be between 1 and 1000 characters" },
        { status: 400 }
      );
    }

    const { userId } = await auth();

    // Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
    const nowTime = Date.now();
    let limiter = rateLimitCache.get(ip);
    if (!limiter || limiter.resetAt < nowTime) {
      limiter = { count: 1, resetAt: nowTime + WINDOW_MS };
    } else {
      limiter.count++;
    }
    rateLimitCache.set(ip, limiter);

    if (limiter.count > RATE_LIMIT) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "Missing GEMINI_API_KEY in .env",
          isCorrect: false,
          correctedSentence: "",
          mistakes: [],
          explanation:
            "Add your Gemini API key in the .env file and restart the server.",
          rule: "",
          difficulty: "Beginner",
          similarExamples: [],
          practiceQuestion: "",
          practiceAnswer: "",
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        temperature: 0.2,
      },
    });

    const prompt = `
You are English Mentor AI, a strict and accurate English grammar teacher for beginners.

Analyze this text wrapped in <text></text> tags:
<text>
${sentence}
</text>

Return only valid JSON with these exact keys:
{
  "isCorrect": boolean,
  "correctedSentence": string,
  "mistakes": string[],
  "explanation": string,
  "rule": string,
  "difficulty": string,
  "similarExamples": string[],
  "practiceQuestion": string,
  "practiceAnswer": string,
  "score": number,
  "scoreExplanation": string
}

Important rules:
- If the sentence is grammatically incorrect, correctedSentence MUST be the fully corrected English sentence.
- explanation MUST never be empty.
- correctedSentence MUST never be empty if the sentence is incorrect.
- mistakes must be short bullet-style strings.
- similarExamples must contain exactly 3 correct examples.
- practiceQuestion must be one fill-in-the-blank question.
- practiceAnswer must be short.
- score MUST be an integer from 0 to 100 representing the grammar quality (100 = perfect, 0 = completely incomprehensible).
- scoreExplanation MUST be a short sentence explaining why this score was given.
- Return plain JSON only, no markdown.

Example:
Input: "She don't like apples."
Output:
{
  "isCorrect": false,
  "correctedSentence": "She doesn't like apples.",
  "mistakes": ["Use 'doesn't' with she.", "Use the base verb 'like' after doesn't."],
  "explanation": "For she, he, and it, use 'doesn't' in the present simple negative form. After doesn't, use the base verb.",
  "rule": "She/He/It + doesn't + base verb",
  "difficulty": "Beginner",
  "similarExamples": ["He doesn't play the piano.", "It doesn't often snow in this city.", "My dog doesn't bark at strangers."],
  "practiceQuestion": "He _____ speak French.",
  "practiceAnswer": "doesn't",
  "score": 45,
  "scoreExplanation": "Subject-verb agreement is incorrect, which is a fundamental rule."
}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    let data: any;

    try {
      data = JSON.parse(raw);
    } catch {
      data = fallbackGrammar(sentence);
    }

    if (!data.correctedSentence || !data.explanation) {
      const fallback = fallbackGrammar(sentence);

      data = {
        ...fallback,
        ...data,
        correctedSentence: data.correctedSentence || fallback.correctedSentence,
        explanation: data.explanation || fallback.explanation,
        rule: data.rule || fallback.rule,
        mistakes:
          Array.isArray(data.mistakes) && data.mistakes.length > 0
            ? data.mistakes
            : fallback.mistakes,
        similarExamples:
          Array.isArray(data.similarExamples) && data.similarExamples.length > 0
            ? data.similarExamples
            : fallback.similarExamples,
        practiceQuestion: data.practiceQuestion || fallback.practiceQuestion,
        practiceAnswer: data.practiceAnswer || fallback.practiceAnswer,
        difficulty: data.difficulty || fallback.difficulty,
        score: typeof data.score === 'number' ? data.score : fallback.score,
        scoreExplanation: data.scoreExplanation || fallback.scoreExplanation,
      };
    }

    if (userId) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (dbUser) {
        await prisma.grammarCheckHistory.create({
          data: {
            userId: dbUser.id,
            originalText: sentence,
            correctedText: data.correctedSentence || "",
            mistakes: data.mistakes || [],
            score: typeof data.score === 'number' ? data.score : 0,
            scoreExplanation: data.scoreExplanation || "No explanation",
          },
        });

        const now = new Date();
        const lastPractice = dbUser.lastPracticeAt;
        let newStreak = dbUser.streakCount;
        let newLongest = dbUser.longestStreak;

        if (!lastPractice) {
          newStreak = 1;
        } else {
          // Compare dates using UTC to prevent time zone drift issues for users
          const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
          const lastDate = new Date(Date.UTC(lastPractice.getUTCFullYear(), lastPractice.getUTCMonth(), lastPractice.getUTCDate()));
          const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        }

        if (newStreak > newLongest) {
          newLongest = newStreak;
        }

        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            streakCount: newStreak,
            longestStreak: newLongest,
            lastPracticeAt: now
          }
        });
      }
    }

    return NextResponse.json({
      isCorrect: Boolean(data.isCorrect),
      correctedSentence: data.correctedSentence || "",
      mistakes: Array.isArray(data.mistakes) ? data.mistakes : [],
      explanation: data.explanation || "No explanation returned.",
      rule: data.rule || "",
      difficulty: data.difficulty || "Beginner",
      similarExamples: Array.isArray(data.similarExamples)
        ? data.similarExamples
        : [],
      practiceQuestion: data.practiceQuestion || "",
      practiceAnswer: data.practiceAnswer || "",
      score: typeof data.score === 'number' ? data.score : 0,
      scoreExplanation: data.scoreExplanation || "",
    });
  } catch (err: any) {
    console.error("Grammar API error:", err);

    return NextResponse.json(
      {
        error: err?.message || "Failed to check grammar",
        isCorrect: false,
        correctedSentence: "",
        mistakes: [],
        explanation:
          "Something went wrong while contacting Gemini. Check your API key and restart the dev server.",
        rule: "",
        difficulty: "Beginner",
        similarExamples: [],
        practiceQuestion: "",
        practiceAnswer: "",
        score: 0,
        scoreExplanation: "API Error",
      },
      { status: 500 }
    );
  }
}