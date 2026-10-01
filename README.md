# English Mentor AI

An AI-powered English learning platform that analyzes grammar, improves writing, tracks learning progress, and provides personalized practice feedback.

## 1. Project overview

English Mentor AI is a full-stack educational tool designed to help users improve their English writing skills. Instead of just pointing out mistakes, the platform provides clear explanations, detailed grammar scoring, and tracks your improvement over time through a personalized dashboard. It is built for students, professionals, and language learners looking to perfect their everyday English.

## 2. Key features

- AI-powered grammar checking and error explanation
- English writing practice with instant feedback
- Gamified grammar score from 0–100
- Persistent writing history and average score calculation
- Daily learning streak tracking
- Interactive dashboard for progress visualization
- Secure authentication and user sessions

## 3. Screenshots

*Screenshots will be added to the `docs/screenshots/` directory.*

## 4. Live Demo

`Live Demo: [Deployment URL Pending]`

## 5. Tech stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts
- **Backend/API:** Next.js API Routes
- **Database:** Prisma ORM, Neon PostgreSQL
- **Authentication:** Clerk
- **AI Integration:** Google Gemini API (`@google/generative-ai`)

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

Create a `.env.local` file at the root of the project by copying `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your actual API keys in `.env.local` (do not commit this file). Then start the development server:

```bash
npm run dev
```

## 9. Environment variables

You will need to configure the following variables in your `.env.local` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database
DATABASE_URL=

# AI Provider
GEMINI_API_KEY=
```

## 10. Project structure

```text
english-mentor-ai/
├── app/                  # Next.js App Router (pages, layouts, api routes)
├── components/           # Reusable React components (UI, charts, grammar tools)
├── lib/                  # Utility functions and shared configuration (Prisma, Gemini)
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── scripts/              # Development scripts and utilities
└── docs/                 # Documentation and screenshots
```

## 11. Author

Akshata Zanjary  
B.Tech Information Technology
