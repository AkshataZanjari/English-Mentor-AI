import { ScenarioId } from "@/lib/pos/scenarios";
import { ScenarioReport, ScenarioTurn } from "@/lib/pos/schemas";
export type { ScenarioId, ScenarioReport, ScenarioTurn as ScenarioTurnResult };
export type ToneType = "casual" | "professional";

export type ScenarioConfig = {
  id: ScenarioId;
  title: string;
  subtitle: string;
  toneLabel: string;
  starter: string;
  role: string;
  chips: string[];
};

export type ScenarioMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  correction?: string;
  naturalAlternative?: string;
  feedback?: string;
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
  },
  {
    id: "formal-emails",
    title: "Formal Emails",
    subtitle: "Write polite emails for exams, applications, follow-ups",
    toneLabel: "Formal",
    starter: "What do you need to write an email about? I will help you draft it.",
    role: "You are a professional email drafting assistant.",
    chips: ["Follow-up after interview", "Request exam schedule"],
  },
  {
    id: "cover-letter",
    title: "Cover Letter",
    subtitle: "Turn a request into a clean job application letter",
    toneLabel: "Formal",
    starter: "Tell me about the job you are applying for and your key skills.",
    role: "You are a career coach helping write a cover letter.",
    chips: ["Applying for IT job", "Applying for marketing role"],
  },
  {
    id: "resume-bullet",
    title: "Resume Bullet Improver",
    subtitle: "Turn simple input into polished resume bullet points",
    toneLabel: "Professional",
    starter: "What did you do in your last project or role? I'll make it a bullet point.",
    role: "You are a resume expert.",
    chips: ["Built a React login page", "Managed a team of 5"],
  },
  {
    id: "sop",
    title: "SOP Helper",
    subtitle: "Generate a clear and formal statement of purpose",
    toneLabel: "Formal",
    starter: "Why do you want to pursue this degree? Tell me your background.",
    role: "You are an admissions consultant.",
    chips: ["Interest in AI", "Career change to tech"],
  },
  {
    id: "interview-answer",
    title: "Interview Answers",
    subtitle: "Practice answering common interview questions",
    toneLabel: "Professional",
    starter: "Let's practice. What are your salary expectations?",
    role: "You are a hiring manager interviewing the user.",
    chips: ["As per industry standards", "Negotiable based on role"],
  },
  {
    id: "gd-practice",
    title: "GD Practice",
    subtitle: "Practice Group Discussion points",
    toneLabel: "Professional",
    starter: "The topic for today's GD is 'Importance of digital skills'. What are your thoughts?",
    role: "You are a GD moderator and participant.",
    chips: ["Digital skills improve efficiency", "AI is replacing jobs"],
  }
];
