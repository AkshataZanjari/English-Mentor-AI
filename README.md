# English Mentor AI

An AI-powered English learning platform that analyzes grammar, improves writing, tracks learning progress, and provides personalized practice feedback.

## 1. Project overview

English Mentor AI is a full-stack educational tool designed to help users improve their English writing skills. Instead of just pointing out mistakes, the platform provides clear explanations, detailed grammar scoring, and tracks your improvement over time through a personalized dashboard. It is built for students, professionals, and language learners looking to perfect their everyday English.

## 2. Key features

- **AI-powered Grammar Checking:** Instant error explanation and gamified grammar score from 0–100.
- **Practice Studio:** Comprehensive suite for tone rewriting, smart replies, scenario practice, and part-of-speech tools.
- **Chat Teacher:** Interactive conversational learning experience.
- **Vocabulary Tools:** Expand your English vocabulary with targeted exercises.
- **Interactive Dashboard:** Visualizes persistent writing history, average score calculations, and daily learning streaks.
- **Secure Authentication:** User sessions and profiles powered by Clerk.

## 3. Screenshots

| Home | Practice Studio | Dashboard |
|:---:|:---:|:---:|
| <img src="./docs/screenshots/home.png" width="250"/> | <img src="./docs/screenshots/practice-studio.png" width="250"/> | <img src="./docs/screenshots/dashboard.png" width="250"/> |

## 4. Live Demo

`Live Demo: [https://english-mentor-ai-starter.vercel.app](https://english-mentor-ai-starter.vercel.app)` *(Deploy to Vercel to match this URL!)*

## 5. Tech stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts
- **Backend/API:** Next.js API Routes
- **Database:** Prisma ORM, Neon PostgreSQL
- **Authentication:** Clerk
- **AI Integration:** Google Gemini API

## 6. Architecture

User
→ Next.js UI
→ Clerk Authentication
→ Next.js API Routes
→ Gemini AI (Grammar & Tone Processing)
→ Prisma ORM
→ Neon PostgreSQL
→ Dashboard / Learning History

## 7. Database

The application uses Prisma with PostgreSQL and stores:
- **User:** Tracks user profiles, longest streaks, current streaks, and the date of their last practice (`lastPracticeAt`).
- **GrammarCheckHistory:** Logs every practice submission, the original text, corrected text, the resulting AI score (0-100), detailed feedback, and timestamps.

## 8. Local setup

To run the project locally, clone the repository and install the dependencies:

```bash
git clone https://github.com/AkshataZanjari/english-mentor-ai.git
cd english-mentor-ai
npm install
```

Create a `.env` file at the root of the project by copying `.env.example`:

```bash
cp .env.example .env
```

Fill in your actual API keys in `.env` (do not commit this file). Then initialize the database schema:

```bash
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

## 9. Environment variables

You will need to configure the following variables in your `.env` file, as shown in `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_postgres_connection_string_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## 10. Project structure

```text
english-mentor-ai/
├── app/                  # Next.js App Router (pages, layouts, api routes)
├── components/           # Reusable React components (UI, charts, grammar tools)
├── lib/                  # Utility functions and shared configuration (Prisma, Gemini)
├── prisma/               # Database schema
└── scripts/              # Development scripts and utilities
```

## 11. Author

Akshata Zanjari  
B.Tech Information Technology
