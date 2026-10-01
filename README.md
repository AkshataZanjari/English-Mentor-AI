
# English Mentor AI

AI-powered English grammar, vocabulary, and communication coach built with Next.js, Gemini API, Clerk, and PostgreSQL.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your keys:
   - Get a free Gemini API key at https://aistudio.google.com
   - Create a free Clerk app at https://clerk.com
   - Create a free Postgres DB at https://neon.tech or https://supabase.com
3. `npx prisma generate && npx prisma db push`
4. `npm run dev`
5. Visit http://localhost:3000

## Features implemented in this starter
- AI Grammar Checker (with explanations, rules, examples, practice)
- Parts of Speech tagging endpoint
- Tense detection endpoint
- Vocabulary improvement endpoint
- AI Chat Teacher endpoint

## Next steps
- Add Prisma calls to save GrammarCheckHistory after each check
- Build Dashboard page with Recharts using QuizAttempt/GrammarCheckHistory data
- Add Grammar Rules Library as static JSON + search UI
- Add dark/light mode toggle
- Deploy frontend to Vercel, DB to Neon

# English-Practice-Studio
“An AI-powered English communication web app that helps users improve writing, speaking, messaging, and career communication through grammar correction, tone rewriting, smart reply generation, voice tools, and real-life scenario practice.”

