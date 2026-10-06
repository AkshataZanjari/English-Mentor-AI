export type ToneType = "casual" | "professional";

export type ScenarioId = "hr-interview" | "manager-project" | "formal-emails" | "cover-letter" | "resume-bullet" | "sop" | "interview-answer" | "gd-practice";

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

export const scenarioConfigs: ScenarioConfig[] = [
  {
    id: "hr-interview",
    title: "Chat with HR before interview",
    subtitle: "Formal tone with polite professional language",
    toneLabel: "Formal",
    starter:
      "Hello, this is Priya from HR. I’m calling to confirm your interview timing and a few details before the meeting.",
    role: "You are HR preparing the candidate before an interview.",
    chips: ["Confirm interview time", "Ask about required documents"],
    reportFocus:
      "Focus on polite professional English, grammar, clarity, and interview readiness.",
    systemPrompt: `You are acting as an HR representative helping a user practice English before an interview.
Goals: Continue naturally as HR. Keep tone formal and polite.
Return JSON: assistantReply, correction, naturalAlternative, feedback`,
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
Goals: Continue naturally as a manager. Keep tone semi-formal.
Return JSON: assistantReply, correction, naturalAlternative, feedback`,
  },
  {
    id: "formal-emails",
    title: "Formal Emails",
    subtitle: "Write polite emails for exams, applications, follow-ups",
    toneLabel: "Formal",
    starter: "What do you need to write an email about? I will help you draft it.",
    role: "You are a professional email drafting assistant.",
    chips: ["Follow-up after interview", "Request exam schedule"],
    reportFocus: "Focus on formal tone, email structure, and polite requests.",
    systemPrompt: `You are acting as an email drafting assistant. Ask the user what they want to write, and help them draft it iteratively.
Return JSON: assistantReply, correction, naturalAlternative, feedback`,
  },
  {
    id: "cover-letter",
    title: "Cover Letter",
    subtitle: "Turn a request into a clean job application letter",
    toneLabel: "Formal",
    starter: "Tell me about the job you are applying for and your key skills.",
    role: "You are a career coach helping write a cover letter.",
    chips: ["Applying for IT job", "Applying for marketing role"],
    reportFocus: "Focus on confident professional tone, structure and relevance.",
    systemPrompt: `You are a career coach helping the user write a cover letter. Ask clarifying questions and help draft it.
Return JSON: assistantReply, correction, naturalAlternative, feedback`,
  },
  {
    id: "resume-bullet",
    title: "Resume Bullet Improver",
    subtitle: "Turn simple input into polished resume bullet points",
    toneLabel: "Professional",
    starter: "What did you do in your last project or role? I'll make it a bullet point.",
    role: "You are a resume expert.",
    chips: ["Built a React login page", "Managed a team of 5"],
    reportFocus: "Focus on action verbs, metrics, and professional phrasing.",
    systemPrompt: `You are a resume expert. Help the user turn their raw input into strong resume bullet points.
Return JSON: assistantReply, correction, naturalAlternative, feedback`,
  },
  {
    id: "sop",
    title: "SOP Helper",
    subtitle: "Generate a clear and formal statement of purpose",
    toneLabel: "Formal",
    starter: "Why do you want to pursue this degree? Tell me your background.",
    role: "You are an admissions consultant.",
    chips: ["Interest in AI", "Career change to tech"],
    reportFocus: "Focus on academic tone, clarity, and persuasive narrative.",
    systemPrompt: `You are an admissions consultant helping the user write an SOP.
Return JSON: assistantReply, correction, naturalAlternative, feedback`,
  },
  {
    id: "interview-answer",
    title: "Interview Answers",
    subtitle: "Practice answering common interview questions",
    toneLabel: "Professional",
    starter: "Let's practice. What are your salary expectations?",
    role: "You are a hiring manager interviewing the user.",
    chips: ["As per industry standards", "Negotiable based on role"],
    reportFocus: "Focus on confident, structured and professional interview answers.",
    systemPrompt: `You are a hiring manager interviewing the user.
Return JSON: assistantReply, correction, naturalAlternative, feedback`,
  },
  {
    id: "gd-practice",
    title: "GD Practice",
    subtitle: "Practice Group Discussion points",
    toneLabel: "Professional",
    starter: "The topic for today's GD is 'Importance of digital skills'. What are your thoughts?",
    role: "You are a GD moderator and participant.",
    chips: ["Digital skills improve efficiency", "AI is replacing jobs"],
    reportFocus: "Focus on coherent arguments, vocabulary, and professional debate tone.",
    systemPrompt: `You are a GD moderator/participant. Engage in the discussion.
Return JSON: assistantReply, correction, naturalAlternative, feedback`,
  }
];

export const speechRecognitionTypes = `
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
  onresult: null | ((event: any) => void);
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}
`;
