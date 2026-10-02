export type ToneType = "genz" | "formal";
export type ThemeMode = "light" | "dark";
export type AppTab = "write" | "reply" | "career" | "voice" | "scenario";
export type CareerTool =
  | "formal-emails"
  | "cover-letter"
  | "resume-bullet"
  | "sop"
  | "interview-answer"
  | "gd-practice";

export type VoiceMode =
  | "speech-to-english"
  | "marathi-to-english"
  | "english-to-marathi";

export type SpeechTarget =
  | "write"
  | "reply-message"
  | "reply-draft"
  | "career"
  | "voice"
  | "scenario";

export type SpeechRecognitionCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: null | (() => void);
  onend: null | (() => void);
  onerror: null | ((event: { error?: string }) => void);
  onresult: null | ((event: SpeechRecognitionEvent) => void);
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export type ScenarioId = "hr-interview" | "friend-exam" | "manager-project";

export type ScenarioConfig = {
  id: ScenarioId;
  title: string;
  subtitle: string;
  toneLabel: string;
  starter: string;
  role: string;
  chips: string[];
  systemPrompt: string;
  reportFocus: string;
};

export type ScenarioMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  correction?: string;
  naturalAlternative?: string;
  feedback?: string;
};

export type ScenarioTurnResult = {
  assistantReply: string;
  correction: string;
  naturalAlternative: string;
  feedback: string;
};

export type ScenarioReport = {
  mistakesSummary: string[];
  betterPhrases: string[];
  toneScore: number;
  overallFeedback: string;
};

export const careerTools: {
  id: CareerTool;
  title: string;
  desc: string;
  prompt: string;
}[] = [
  {
    id: "formal-emails",
    title: "Formal Emails",
    desc: "Write polite emails for exams, applications, follow-ups, and office communication.",
    prompt:
      "Write a polite formal email asking for the exam schedule and confirmation details. Use clear, simple, professional English.",
  },
  {
    id: "cover-letter",
    title: "Cover Letter",
    desc: "Turn a request into a clean job application letter.",
    prompt:
      "Write a short cover letter for a fresher applying for an IT job. Keep it formal, confident, and simple.",
  },
  {
    id: "resume-bullet",
    title: "Resume Bullet Improver",
    desc: "Turn simple input into polished resume bullet points.",
    prompt:
      "Create 4 professional resume bullet points for a college project made with React and a login page.",
  },
  {
    id: "sop",
    title: "SOP Helper",
    desc: "Generate a clear and formal statement of purpose.",
    prompt:
      "Write a short statement of purpose for a student applying for higher studies. Keep the English formal and clear.",
  },
  {
    id: "interview-answer",
    title: "Interview Answers",
    desc: "Type a question and get the exact answer a candidate should say.",
    prompt: "What are your salary expectations?",
  },
  {
    id: "gd-practice",
    title: "GD Practice",
    desc: "Type a GD topic or question and get ready-to-speak points.",
    prompt:
      "Give 4 clear group discussion points on the importance of digital skills for students.",
  },
];

export const scenarioConfigs: ScenarioConfig[] = [
  {
    id: "hr-interview",
    title: "Chat with HR before interview",
    subtitle: "Formal tone with polite professional language",
    toneLabel: "Formal",
    starter:
      "Hello, this is Priya from HR. I’m calling to confirm your interview timing and a few details before the meeting.",
    role: "You are HR preparing the candidate before an interview in an Indian job context.",
    chips: ["Confirm interview time", "Ask about required documents", "Politely ask a question"],
    reportFocus:
      "Focus on polite professional English, grammar, clarity, and interview readiness.",
    systemPrompt: `You are acting as an HR representative in India helping a user practice English before an interview.

Goals:
- Continue the conversation naturally as HR.
- Keep the tone formal, polite, supportive, and realistic for Indian job contexts.
- After every user message, provide:
  1) a corrected version,
  2) a natural alternative,
  3) one short feedback line,
  4) your next in-role HR reply.

Return STRICT JSON with keys:
assistantReply, correction, naturalAlternative, feedback

Rules:
- assistantReply must stay in role as HR.
- correction must preserve the user's meaning but fix grammar.
- naturalAlternative should sound smoother and more natural.
- feedback should be short and practical.
- Do not include markdown fences.
- Keep assistantReply under 80 words.`,
  },
  {
    id: "friend-exam",
    title: "Texting a friend about exam results",
    subtitle: "Gen Z tone that still sounds natural",
    toneLabel: "Gen Z",
    starter:
      "Heyy, results are out 😭 How did your exam go? I’m low-key scared to check mine.",
    role: "You are a close friend chatting casually about exam results.",
    chips: ["React casually", "Say you're nervous", "Ask your friend's score"],
    reportFocus:
      "Focus on natural texting, grammar balance, and casual tone without sounding broken.",
    systemPrompt: `You are acting as a close friend in a casual chat about exam results.

Goals:
- Continue the conversation naturally like a friend texting.
- Keep the tone Gen Z, casual, friendly, and grammatically understandable.
- After every user message, provide:
  1) a corrected version,
  2) a natural alternative,
  3) one short feedback line,
  4) your next in-role friend reply.

Return STRICT JSON with keys:
assistantReply, correction, naturalAlternative, feedback

Rules:
- assistantReply should sound casual, modern, and friendly.
- correction should fix grammar while keeping the user's tone.
- naturalAlternative can include light slang, but it must stay understandable.
- feedback should be one short coaching line.
- Do not include markdown fences.
- Keep assistantReply under 60 words.`,
  },
  {
    id: "manager-project",
    title: "Explaining a project to a manager",
    subtitle: "Semi-formal tone with confident clarity",
    toneLabel: "Semi-formal",
    starter:
      "Hi, can you walk me through your project and explain what problem it solves?",
    role: "You are a manager asking the user to explain a project clearly and confidently.",
    chips: ["Explain project goal", "Describe your role", "Talk about challenges"],
    reportFocus:
      "Focus on structured explanation, clarity, confidence, and semi-formal workplace English.",
    systemPrompt: `You are acting as a manager asking a candidate or employee to explain a project.

Goals:
- Continue the conversation naturally as a manager.
- Keep the tone semi-formal, realistic, and suitable for Indian workplace conversations.
- After every user message, provide:
  1) a corrected version,
  2) a natural alternative,
  3) one short feedback line,
  4) your next in-role manager reply.

Return STRICT JSON with keys:
assistantReply, correction, naturalAlternative, feedback

Rules:
- assistantReply must stay in role as a manager.
- correction should improve grammar and clarity.
- naturalAlternative should sound clearer and more confident.
- feedback should be concise and actionable.
- Do not include markdown fences.
- Keep assistantReply under 80 words.`,
  },
];

export const writeEmojiSuggestions = ["😭", "😂", "✨", "💀", "🥲", "🔥", "🤞", "🙃"];
export const examEmojiSuggestions = ["😭", "🥲", "💀", "😂", "🤞", "📚", "🔥", "😭🙏"];
