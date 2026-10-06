import { z } from "zod";

export const rewriteBodySchema = z.object({
  text: z.string().min(1, "Text is required").max(1000, "Text is too long"),
  tone: z.enum(["casual", "professional"]).optional(),
});

export const checkBodySchema = z.object({
  text: z.string().min(1, "Text is required").max(1000, "Text is too long"),
});

export const replyBodySchema = z.object({
  message: z.string().min(1, "Message is required").max(1000, "Message is too long"),
  draftReply: z.string().max(1000, "Draft reply is too long").optional().default(""),
});

export const roleplayBodySchema = z.object({
  scenarioId: z.enum([
    "hr-interview",
    "manager-project",
    "formal-emails",
    "cover-letter",
    "resume-bullet",
    "sop",
    "interview-answer",
    "gd-practice",
  ]),
  action: z.enum(["turn", "report"]),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      text: z.string().max(1000, "Message too long"),
    })
  ).max(30, "Too many messages"),
});

export const scenarioTurnSchema = z.object({
  assistantReply: z.string().min(1),
  correction: z.string().default(""),
  naturalAlternative: z.string().default(""),
  feedback: z.string().default(""),
});

export const scenarioReportSchema = z.object({
  mistakesSummary: z.array(z.string()).default([]),
  betterPhrases: z.array(z.string()).default([]),
  toneScore: z.number().min(1).max(10).default(7),
  overallFeedback: z.string().default(""),
});

export const checkResultSchema = z.object({
  result: z.string().min(1),
  details: z.array(z.string()).default([]),
});

export const replyResultSchema = z.object({
  suggestions: z.array(z.string()).min(0).max(2).default([]),
  improvedReply: z.string().default(""),
});

export type RewriteBody = z.infer<typeof rewriteBodySchema>;
export type CheckBody = z.infer<typeof checkBodySchema>;
export type ReplyBody = z.infer<typeof replyBodySchema>;
export type ScenarioTurn = z.infer<typeof scenarioTurnSchema>;
export type ScenarioReport = z.infer<typeof scenarioReportSchema>;
export type CheckResult = z.infer<typeof checkResultSchema>;
export type ReplyResult = z.infer<typeof replyResultSchema>;