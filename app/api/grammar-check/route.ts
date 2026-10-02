import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateStructured } from "@/lib/pos/model";

const sentenceSchema = z.string().min(1).max(1000);

const grammarCheckResultSchema = z.object({
  isCorrect: z.boolean(),
  correctedSentence: z.string(),
  mistakes: z.array(z.string()),
  explanation: z.string(),
  rule: z.string(),
  difficulty: z.string(),
  similarExamples: z.array(z.string()),
  practiceQuestion: z.string(),
  practiceAnswer: z.string(),
  score: z.number().int().min(0).max(100),
  scoreExplanation: z.string(),
});

// Basic in-memory rate limiter
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // max requests per minute
const WINDOW_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let sentence = "";
    try {
      sentence = sentenceSchema.parse(String(body?.sentence || "").trim());
    } catch {
      return NextResponse.json(
        { error: "Sentence must be between 1 and 1000 characters" },
        { status: 400 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        { error: "Missing GEMINI_API_KEY in .env" },
        { status: 500 }
      );
    }

    const prompt = `You are English Mentor AI, a strict and accurate English grammar teacher for beginners.

Analyze this text wrapped in <text></text> tags:
<text>
${sentence}
</text>

Important rules:
- If the sentence is grammatically incorrect, correctedSentence MUST be the fully corrected English sentence.
- explanation MUST never be empty.
- correctedSentence MUST never be empty if the sentence is incorrect.
- mistakes must be short bullet-style strings.
- similarExamples must contain exactly 3 correct examples.
- practiceQuestion must be one fill-in-the-blank question.
- practiceAnswer must be short.
- score MUST be an integer from 0 to 100 representing the grammar quality (100 = perfect, 0 = completely incomprehensible).
- scoreExplanation MUST be a short sentence explaining why this score was given.`;

    const data = await generateStructured({
      prompt,
      schema: grammarCheckResultSchema,
    });

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
          score: data.score || 0,
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

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("Grammar API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to check grammar" },
      { status: 500 }
    );
  }
}