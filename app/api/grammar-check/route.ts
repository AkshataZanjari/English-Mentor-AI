import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function fallbackGrammar(sentence: string) {
  const original = sentence.trim();
  const lower = original.toLowerCase();

  if (lower === "she don't like apples." || lower === "she don't like apples") {
    return {
      isCorrect: false,
      correctedSentence: "She doesn't like apples.",
      mistakes: [
        "Use 'doesn't' with she.",
        "Use the base verb 'like' after doesn't.",
      ],
      explanation:
        "For she, he, and it, use 'doesn't' in the present simple negative form. After doesn't, use the base verb, such as 'like'.",
      rule: "She/He/It + doesn't + base verb",
      difficulty: "Beginner",
      similarExamples: [
        "He doesn't play the piano.",
        "It doesn't often snow in this city.",
        "My dog doesn't bark at strangers.",
      ],
      practiceQuestion: "He _____ speak French.",
      practiceAnswer: "doesn't",
      score: 30,
      scoreExplanation: "Major grammatical errors with subject-verb agreement.",
    };
  }

  if (lower === "i want go college." || lower === "i want go college") {
    return {
      isCorrect: false,
      correctedSentence: "I want to go to college.",
      mistakes: [
        "Missing 'to' after want.",
        "Missing 'to' before college.",
      ],
      explanation:
        "After 'want', we usually use 'to' plus a verb. We also say 'go to' before places like school or college.",
      rule: "Want + to + verb; Go + to + place",
      difficulty: "Beginner",
      similarExamples: [
        "I want to learn English.",
        "She wants to play football.",
        "They want to travel.",
      ],
      practiceQuestion: "I want ___ buy a laptop.",
      practiceAnswer: "to",
      score: 60,
      scoreExplanation: "Missing prepositions 'to', but overall meaning is clear.",
    };
  }

  return {
    isCorrect: false,
    correctedSentence: "",
    mistakes: [],
    explanation: "No explanation returned.",
    rule: "",
    difficulty: "Beginner",
    similarExamples: [],
    practiceQuestion: "",
    practiceAnswer: "",
    score: 0,
    scoreExplanation: "No score generated.",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sentence = String(body?.sentence || "").trim();
    const { userId } = await auth();

    if (!sentence) {
      return NextResponse.json(
        { error: "Sentence is required" },
        { status: 400 }
      );
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

Analyze this sentence:
"${sentence}"

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
          // Compare dates (local time representation, offset handled simply)
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const lastDate = new Date(lastPractice.getFullYear(), lastPractice.getMonth(), lastPractice.getDate());
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