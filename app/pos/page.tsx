"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  ToneType,
  ThemeMode,
  AppTab,
  CareerTool,
  VoiceMode,
  SpeechTarget,
  SpeechRecognitionCtor,
  ScenarioId,
  ScenarioConfig,
  ScenarioMessage,
  ScenarioTurnResult,
  ScenarioReport,
  careerTools,
  scenarioConfigs,
  writeEmojiSuggestions,
  examEmojiSuggestions,
} from "./config";
import { SectionShell, Card, SubtleChip, ResultPanel } from "./ui";

export default function POSPage() {
  const [activeTab, setActiveTab] = useState<AppTab>("write");
  const [theme, setTheme] = useState<ThemeMode>("dark");

  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState("");
  const [details, setDetails] = useState<string[]>([]);
  const [toneLoading, setToneLoading] = useState<ToneType | "">("");
  const [checking, setChecking] = useState(false);
  const [grammarScore, setGrammarScore] = useState<number | null>(null);

  const [replyMessage, setReplyMessage] = useState("");
  const [draftReply, setDraftReply] = useState("");
  const [replySuggestions, setReplySuggestions] = useState<string[]>([]);
  const [improvedReply, setImprovedReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const [copiedText, setCopiedText] = useState("");

  const [careerTool, setCareerTool] = useState<CareerTool>("formal-emails");
  const [careerPrompt, setCareerPrompt] = useState(careerTools[0].prompt);
  const [careerResult, setCareerResult] = useState("");
  const [careerLoading, setCareerLoading] = useState(false);

  const [voiceMode, setVoiceMode] = useState<VoiceMode>("speech-to-english");
  const [voiceInput, setVoiceInput] = useState("");
  const [voiceResult, setVoiceResult] = useState("");
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceSupportChecked, setVoiceSupportChecked] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const [activeMicTarget, setActiveMicTarget] = useState<SpeechTarget | "">("");
  const [speechStatus, setSpeechStatus] = useState("");

  const [selectedScenarioId, setSelectedScenarioId] =
    useState<ScenarioId>("hr-interview");
  const [scenarioMessages, setScenarioMessages] = useState<ScenarioMessage[]>([]);
  const [scenarioInput, setScenarioInput] = useState("");
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioReportLoading, setScenarioReportLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState("");
  const [scenarioReport, setScenarioReport] = useState<ScenarioReport | null>(null);

  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);
  const scenarioChatRef = useRef<HTMLDivElement | null>(null);
  const sentenceRef = useRef<HTMLTextAreaElement | null>(null);
  const scenarioInputRef = useRef<HTMLTextAreaElement | null>(null);

  const currentCareerTool = useMemo(
    () => careerTools.find((tool) => tool.id === careerTool) ?? careerTools[0],
    [careerTool]
  );

  const selectedScenario = useMemo(
    () =>
      scenarioConfigs.find((scenario) => scenario.id === selectedScenarioId) ??
      scenarioConfigs[0],
    [selectedScenarioId]
  );

  const isFriendScenario = selectedScenarioId === "friend-exam";

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    setVoiceSupported(Boolean(SpeechRecognition));
    setVoiceSupportChecked(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    setCareerPrompt(currentCareerTool.prompt);
    setCareerResult("");
  }, [careerTool, currentCareerTool.prompt]);

  useEffect(() => {
    startScenario(selectedScenario);
  }, [selectedScenario]);

  useEffect(() => {
    if (scenarioChatRef.current) {
      scenarioChatRef.current.scrollTop = scenarioChatRef.current.scrollHeight;
    }
  }, [scenarioMessages]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function insertTextAtCursor(
    currentValue: string,
    insertValue: string,
    textarea: HTMLTextAreaElement | null,
    setter: (value: string) => void
  ) {
    if (!textarea) {
      const spacer = currentValue.trim().length > 0 ? " " : "";
      setter(`${currentValue}${spacer}${insertValue}`.trim());
      return;
    }

    const start = textarea.selectionStart ?? currentValue.length;
    const end = textarea.selectionEnd ?? currentValue.length;
    const before = currentValue.slice(0, start);
    const after = currentValue.slice(end);

    const needsLeadingSpace = before.length > 0 && !before.endsWith(" ");
    const needsTrailingSpace = after.length > 0 && !after.startsWith(" ");

    const insertedText = `${needsLeadingSpace ? " " : ""}${insertValue}${needsTrailingSpace ? " " : ""}`;
    const nextValue = `${before}${insertedText}${after}`;

    setter(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const nextCursor = before.length + insertedText.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function addEmojiToSentence(emoji: string) {
    insertTextAtCursor(sentence, emoji, sentenceRef.current, setSentence);
  }

  function addEmojiToScenario(emoji: string) {
    insertTextAtCursor(scenarioInput, emoji, scenarioInputRef.current, setScenarioInput);
  }

  function startScenario(config: ScenarioConfig) {
    setScenarioMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: config.starter,
      },
    ]);
    setScenarioInput("");
    setScenarioError("");
    setScenarioReport(null);
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 1200);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  function handleTabKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    current: AppTab
  ) {
    const tabs: AppTab[] = ["write", "reply", "career", "voice", "scenario"];
    const currentIndex = tabs.indexOf(current);

    if (e.key === "ArrowRight") {
      setActiveTab(tabs[(currentIndex + 1) % tabs.length]);
    }

    if (e.key === "ArrowLeft") {
      setActiveTab(tabs[(currentIndex - 1 + tabs.length) % tabs.length]);
    }
  }

  function getVoiceRecognitionLang(mode: VoiceMode) {
    if (mode === "marathi-to-english") return "mr-IN";
    return "en-IN";
  }

  function getLangForTarget(target: SpeechTarget) {
    if (target === "voice") return getVoiceRecognitionLang(voiceMode);
    return "en-IN";
  }

  function getSpeakLangFromMode(mode: VoiceMode) {
    if (mode === "english-to-marathi") return "mr-IN";
    return "en-IN";
  }

  function getVoicePlaceholder(mode: VoiceMode) {
    if (mode === "speech-to-english") {
      return "Speak or type rough English. Example: I am go market yesterday.";
    }
    if (mode === "marathi-to-english") {
      return "मराठीत बोला किंवा लिहा. Example: मला आज ऑफिसला उशीर होईल.";
    }
    return "Type or speak in English. Example: I will be late to the office today.";
  }

  function getVoicePrompt(mode: VoiceMode, text: string) {
    if (mode === "speech-to-english") {
      return `You are a professional English assistant.

Task:
Convert the user's spoken or typed text into a grammatically correct, natural English sentence or paragraph.

Rules:
- Output only the final corrected English text.
- Keep the original meaning.
- Do not explain corrections.
- Make it sound natural and clear.

User text:
${text}`;
    }

    if (mode === "marathi-to-english") {
      return `You are a professional translation assistant.

Task:
Translate the following Marathi text into clear, natural, grammatically correct English.

Rules:
- Output only the final English translation.
- Do not explain anything.
- Preserve the meaning.

Marathi text:
${text}`;
    }

    return `You are a professional translation assistant.

Task:
Translate the following English text into natural Marathi.

Rules:
- Output only the final Marathi translation.
- Do not explain anything.
- Preserve the meaning.

English text:
${text}`;
  }

  function speakText(text: string, lang: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice =
      voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ||
      voices.find((voice) =>
        voice.lang.toLowerCase().startsWith(lang.split("-")[0].toLowerCase())
      );

    if (matchedVoice) utterance.voice = matchedVoice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function updateTargetText(target: SpeechTarget, text: string) {
    if (target === "write") setSentence(text);
    if (target === "reply-message") setReplyMessage(text);
    if (target === "reply-draft") setDraftReply(text);
    if (target === "career") setCareerPrompt(text);
    if (target === "voice") setVoiceInput(text);
    if (target === "scenario") setScenarioInput(text);
  }

  function stopListening() {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setActiveMicTarget("");
    setSpeechStatus("");
  }

  function startListeningForField(target: SpeechTarget) {
    setVoiceError("");
    setScenarioError("");
    setSpeechStatus("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const errorMessage =
        "Voice input is not supported in this browser. Please use Chrome.";
      setVoiceError(errorMessage);
      setScenarioError(errorMessage);
      setSpeechStatus(errorMessage);
      return;
    }

    try {
      if (recognitionRef.current) recognitionRef.current.stop();

      const recognition = new SpeechRecognition();
      recognition.lang = getLangForTarget(target);
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setActiveMicTarget(target);
        setSpeechStatus("Listening...");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i += 1) {
          transcript += event.results[i][0].transcript;
        }
        updateTargetText(target, transcript.trim());
      };

      recognition.onerror = (event: { error?: string }) => {
        setActiveMicTarget("");
        setSpeechStatus(
          event?.error ? `Voice input error: ${event.error}` : "Voice input failed."
        );

        if (target === "voice") {
          setVoiceError(
            event?.error
              ? `Voice input error: ${event.error}`
              : "Voice input failed. Please try again."
          );
        }

        if (target === "scenario") {
          setScenarioError(
            event?.error
              ? `Voice input error: ${event.error}`
              : "Voice input failed. Please try again."
          );
        }
      };

      recognition.onend = () => {
        setActiveMicTarget("");
        setSpeechStatus("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setActiveMicTarget("");
      setSpeechStatus("Unable to start voice input.");

      if (target === "voice") {
        setVoiceError("Unable to start voice input. Please try again.");
      }

      if (target === "scenario") {
        setScenarioError("Unable to start voice input. Please try again.");
      }
    }
  }

  async function checkText() {
    if (!sentence.trim()) return;

    try {
      setChecking(true);
      setResult("");
      setDetails([]);
      setGrammarScore(null);

      const response = await fetch("/api/grammar-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Request failed");
      }

      setResult(payload.correctedSentence || "No result returned.");
      setGrammarScore(payload.score ?? 0);
      setDetails([
        payload.explanation,
        ...(Array.isArray(payload.mistakes) ? payload.mistakes : []),
      ]);
    } catch {
      setResult("Something went wrong. Please try again.");
      setDetails([]);
    } finally {
      setChecking(false);
    }
  }

  async function rewriteTone(tone: ToneType) {
    if (!sentence.trim()) return;

    try {
      setToneLoading(tone);
      setResult("");
      setDetails([]);

      const response = await fetch("/api/pos/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sentence, tone }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Request failed");
      }

      setResult(payload.data.result || "No result returned.");
    } catch {
      setResult("Something went wrong. Please try again.");
    } finally {
      setToneLoading("");
    }
  }

  async function generateReplies() {
    if (!replyMessage.trim()) return;

    try {
      setReplyLoading(true);
      setReplySuggestions([]);
      setImprovedReply("");

      const response = await fetch("/api/pos/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage,
          draftReply,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Request failed");
      }

      setReplySuggestions(
        Array.isArray(payload.data.suggestions) ? payload.data.suggestions.slice(0, 2) : []
      );
      setImprovedReply(payload.data.improvedReply || "");
    } catch {
      setReplySuggestions([]);
      setImprovedReply("");
    } finally {
      setReplyLoading(false);
    }
  }

  async function improveCareerPrompt() {
    if (!careerPrompt.trim()) return;

    try {
      setCareerLoading(true);
      setCareerResult("");

      const finalText = `You are a professional English and career assistant.

Task:
Read the user's question or request and give the exact final answer or final output they need.

Rules:
- Output only the final answer or final written content.
- Do not explain what you changed.
- Do not give tips, notes, or commentary.
- Do not repeat the user's question unless necessary in the answer.
- Keep the response clear, natural, professional, and ready to use.
- If it is an interview or GD question, answer it directly.
- If it is an email request, write the full email directly.
- If it is a cover letter or SOP request, write the full response directly.
- If it is a resume bullet request, write polished bullet points directly.

User request:
${careerPrompt}`;

      const response = await fetch("/api/pos/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: finalText,
          tone: "formal",
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Request failed");
      }

      setCareerResult(payload.data.result || "No result returned.");
    } catch {
      setCareerResult("Something went wrong. Please try again.");
    } finally {
      setCareerLoading(false);
    }
  }

  async function runVoiceTransform() {
    if (!voiceInput.trim()) return;

    try {
      setVoiceLoading(true);
      setVoiceResult("");
      setVoiceError("");

      const response = await fetch("/api/pos/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: getVoicePrompt(voiceMode, voiceInput),
          tone: "formal",
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Request failed");
      }

      setVoiceResult(payload.data.result || "No result returned.");
    } catch {
      setVoiceResult("");
      setVoiceError("Something went wrong. Please try again.");
    } finally {
      setVoiceLoading(false);
    }
  }

  async function sendScenarioMessage(prefilledText?: string) {
    const messageText = (prefilledText ?? scenarioInput).trim();
    if (!messageText) return;

    const userMessage: ScenarioMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: messageText,
    };

    const updatedMessages = [...scenarioMessages, userMessage];
    setScenarioMessages(updatedMessages);
    setScenarioInput("");
    setScenarioError("");
    setScenarioReport(null);

    try {
      setScenarioLoading(true);

      const transcript = updatedMessages
        .map((msg) => `${msg.role === "assistant" ? "Tutor" : "User"}: ${msg.text}`)
        .join("\n");

      const prompt = `${selectedScenario.systemPrompt}

Scenario:
${selectedScenario.title}
Tone:
${selectedScenario.subtitle}
Role:
${selectedScenario.role}

Conversation so far:
${transcript}

Latest user message:
${messageText}`;

      const response = await fetch("/api/pos/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: prompt,
          tone: "formal",
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Request failed");
      }

      const parsed: ScenarioTurnResult = JSON.parse(payload.data.result);

      const assistantMessage: ScenarioMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: parsed?.assistantReply || "Thanks. Can you explain that a bit more clearly?",
        correction: parsed?.correction || "",
        naturalAlternative: parsed?.naturalAlternative || "",
        feedback: parsed?.feedback || "",
      };

      setScenarioMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setScenarioError("Unable to continue the scenario right now. Please try again.");
    } finally {
      setScenarioLoading(false);
    }
  }

  async function endScenarioAndGenerateReport() {
    if (scenarioMessages.length < 2) return;

    try {
      setScenarioReportLoading(true);
      setScenarioError("");

      const transcript = scenarioMessages
        .map((msg) => `${msg.role === "assistant" ? "Tutor" : "User"}: ${msg.text}`)
        .join("\n");

      const prompt = `You are an English speaking coach for Indian students and job seekers.

Task:
Analyze the conversation below and create a short coaching report.

Scenario:
${selectedScenario.title}

Focus:
${selectedScenario.reportFocus}

Conversation:
${transcript}

Return STRICT JSON with keys:
mistakesSummary, betterPhrases, toneScore, overallFeedback

Rules:
- mistakesSummary must be an array of 3 short bullet-style strings.
- betterPhrases must be an array of 3 short useful phrases.
- toneScore must be a number from 1 to 10.
- overallFeedback must be 2 short sentences.
- Do not use markdown fences.
- Be supportive and practical.`;

      const response = await fetch("/api/pos/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: prompt,
          tone: "formal",
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Request failed");
      }

      const parsed: ScenarioReport = JSON.parse(payload.data.result);

      setScenarioReport({
        mistakesSummary: Array.isArray(parsed?.mistakesSummary)
          ? parsed.mistakesSummary.slice(0, 3)
          : [],
        betterPhrases: Array.isArray(parsed?.betterPhrases)
          ? parsed.betterPhrases.slice(0, 3)
          : [],
        toneScore:
          typeof parsed?.toneScore === "number"
            ? Math.max(1, Math.min(10, parsed.toneScore))
            : 7,
        overallFeedback: parsed?.overallFeedback || "",
      });
    } catch {
      setScenarioError("Unable to generate the session report right now.");
    } finally {
      setScenarioReportLoading(false);
    }
  }

  function clearMainTool() {
    setSentence("");
    setResult("");
    setDetails([]);
    setGrammarScore(null);
  }

  function clearReplyTool() {
    setReplyMessage("");
    setDraftReply("");
    setReplySuggestions([]);
    setImprovedReply("");
  }

  function clearVoiceTool() {
    stopListening();
    setVoiceInput("");
    setVoiceResult("");
    setVoiceError("");
  }

  function clearScenarioTool() {
    stopListening();
    startScenario(selectedScenario);
  }

  function TabButton({
    id,
    label,
    shortLabel,
    icon,
  }: {
    id: AppTab;
    label: string;
    shortLabel?: string;
    icon: React.ReactNode;
  }) {
    const isActive = activeTab === id;

    return (
      <button
        id={`tab-${id}`}
        role="tab"
        type="button"
        aria-selected={isActive}
        aria-controls={`panel-${id}`}
        tabIndex={isActive ? 0 : -1}
        onClick={() => setActiveTab(id)}
        onKeyDown={(e) => handleTabKeyDown(e, id)}
        className={`flex min-h-[48px] items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
          isActive
            ? "border-slate-950 bg-slate-950 text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)] dark:border-white dark:bg-slate-100 dark:text-slate-950"
            : "border-black/10 bg-white/75 text-[#3b3128] hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/14"
        }`}
      >
        <span className={`opacity-95 ${isActive ? "" : "dark:text-slate-100"}`}>{icon}</span>
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{shortLabel ?? label}</span>
      </button>
    );
  }

  function MicButton({
    target,
    label,
  }: {
    target: SpeechTarget;
    label: string;
  }) {
    const isActive = activeMicTarget === target;

    return (
      <button
        type="button"
        aria-label={isActive ? `Stop voice input for ${label}` : `Start voice input for ${label}`}
        title={isActive ? `Stop voice input for ${label}` : `Start voice input for ${label}`}
        aria-pressed={isActive}
        onClick={() => (isActive ? stopListening() : startListeningForField(target))}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
          isActive
            ? "border-rose-400/60 bg-rose-500 text-white shadow-[0_0_0_6px_rgba(244,63,94,0.16)]"
            : "border-black/10 bg-white text-[#2b241b] hover:bg-white/90 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
        }`}
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" />
          <path d="M19 11a7 7 0 0 1-14 0" />
          <path d="M12 18v3" />
          <path d="M8 21h8" />
        </svg>
      </button>
    );
  }

  function FieldHeader({
    htmlFor,
    label,
    micTarget,
    hint,
  }: {
    htmlFor: string;
    label: string;
    micTarget: SpeechTarget;
    hint?: string;
  }) {
    return (
      <div className="flex items-start justify-between gap-3">
        <div>
          <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {label}
          </label>
          {hint ? (
            <p className="mt-1 text-xs text-[#73685c] dark:text-slate-300">{hint}</p>
          ) : null}
        </div>
        <MicButton target={micTarget} label={label} />
      </div>
    );
  }



  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#2b241b] transition-colors dark:bg-[#07111f] dark:text-slate-100">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 left-[-80px] h-[320px] w-[320px] rounded-full bg-orange-200/40 blur-[120px] dark:bg-cyan-500/10" />
        <div className="absolute right-[-40px] top-[70px] h-[320px] w-[320px] rounded-full bg-rose-200/30 blur-[120px] dark:bg-violet-500/10" />
        <div className="absolute bottom-[-60px] left-1/3 h-[280px] w-[280px] rounded-full bg-amber-200/30 blur-[120px] dark:bg-fuchsia-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_36%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6">
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#5f554b] dark:border-white/15 dark:bg-white/10 dark:text-slate-200">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  English Practice Studio
                </div>

                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-slate-100">
                    Sharper English, cleaner replies, and smarter speaking practice
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5f554b] dark:text-slate-300">
                    Practice writing, improve replies, prepare for career tasks, translate voice,
                    and train with guided scenario chats in one polished workspace.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/15 dark:bg-white/10">
                  {speechStatus ? (
                    <p className="text-rose-600 dark:text-rose-300">{speechStatus}</p>
                  ) : (
                    <p className="text-[#73685c] dark:text-slate-200">
                      Use the mic on any field for faster practice.
                    </p>
                  )}
                </div>

                <button
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-white/90 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                >
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
              </div>
            </div>
          </Card>
        </header>

        <nav
          aria-label="Primary sections"
          className="mb-6 rounded-[28px] border border-black/8 bg-white/70 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]"
        >
          <div role="tablist" aria-label="Main sections" className="flex flex-wrap gap-2">
            <TabButton
              id="write"
              label="Write Better"
              shortLabel="Write"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                </svg>
              }
            />
            <TabButton
              id="reply"
              label="Reply Better"
              shortLabel="Reply"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 17 4 12l5-5" />
                  <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                </svg>
              }
            />
            <TabButton
              id="career"
              label="Career Prep"
              shortLabel="Career"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v16" />
                </svg>
              }
            />
            <TabButton
              id="voice"
              label="Voice & Translate"
              shortLabel="Voice"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" />
                  <path d="M19 11a7 7 0 0 1-14 0" />
                  <path d="M12 18v3" />
                </svg>
              }
            />
            <TabButton
              id="scenario"
              label="Scenario Practice"
              shortLabel="Scenario"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
            />
          </div>
        </nav>

        {activeTab === "write" && (
          <SectionShell
            eyebrow="Writing practice"
            title="Check grammar, rewrite tone, and make your message sound right"
            subtitle="Use this when you want a cleaner sentence, a formal version, or a more Gen Z style with better wording."
          >
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
              <Card>
                <div className="space-y-4">
                  <FieldHeader
                    htmlFor="sentence"
                    label="Your Sentence"
                    micTarget="write"
                    hint="Type or speak rough English here."
                  />

                  <textarea
                    ref={sentenceRef}
                    id="sentence"
                    value={sentence}
                    onChange={(e) => setSentence(e.target.value)}
                    rows={6}
                    placeholder="Example: I am go market yesterday."
                    className="w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-4 text-[16px] leading-relaxed text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 dark:border-white/15 dark:bg-black/20 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-white dark:focus:ring-white/10"
                  />

                  <div className="flex flex-wrap gap-3 items-center">
                    <button
                      onClick={checkText}
                      disabled={!sentence.trim() || checking || toneLoading !== ""}
                      className="min-h-[48px] rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      {checking ? "Checking..." : "Check My English"}
                    </button>

                    <button
                      onClick={() => rewriteTone("formal")}
                      disabled={!sentence.trim() || checking || toneLoading !== ""}
                      className="min-h-[48px] rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                    >
                      {toneLoading === "formal" ? "Converting..." : "Make it Formal"}
                    </button>

                    <button
                      onClick={() => rewriteTone("genz")}
                      disabled={!sentence.trim() || checking || toneLoading !== ""}
                      className="min-h-[48px] rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                    >
                      {toneLoading === "genz" ? "Converting..." : "Make it Gen Z"}
                    </button>

                    <div className="flex-1 min-w-[20px]" />

                    <button
                      onClick={clearMainTool}
                      className="min-h-[48px] rounded-2xl text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </Card>

              {result && (
                <ResultPanel
                  title={grammarScore !== null ? `Grammar Score: ${grammarScore}/100` : "Your Result"}
                  content={result}
                  onCopy={() => copyText(result)}
                  isCopied={copiedText === result}
                  empty="Your corrected or rewritten output will appear here."
                >
                  {details.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-black/8 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Feedback</p>
                      <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[#5f554b] dark:text-slate-300">
                        {details.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </ResultPanel>
              )}
            </div>
          </SectionShell>
        )}

        {activeTab === "reply" && (
          <SectionShell
            eyebrow="Message replies"
            title="Generate cleaner replies and improve rough drafts"
            subtitle="Paste the received message, add your rough response if you want, and get better reply options fast."
          >
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <FieldHeader
                      htmlFor="replyMessage"
                      label="Received message"
                      micTarget="reply-message"
                      hint="Paste the message you want to answer."
                    />
                    <textarea
                      id="replyMessage"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={5}
                      placeholder="Example: Are you coming tonight?"
                      className="w-full resize-y rounded-[24px] border border-black/10 bg-white px-4 py-4 text-[15px] leading-7 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 dark:border-white/15 dark:bg-black/20 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-white dark:focus:ring-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldHeader
                      htmlFor="draftReply"
                      label="Your rough reply"
                      micTarget="reply-draft"
                      hint="Optional. Add your draft and we’ll improve it."
                    />
                    <textarea
                      id="draftReply"
                      value={draftReply}
                      onChange={(e) => setDraftReply(e.target.value)}
                      rows={5}
                      placeholder="Example: Yeah my dad doesn't allowed me so I can't come tonight"
                      className="w-full resize-y rounded-[24px] border border-black/10 bg-white px-4 py-4 text-[15px] leading-7 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 dark:border-white/15 dark:bg-black/20 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-white dark:focus:ring-white/10"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={generateReplies}
                      disabled={!replyMessage.trim() || replyLoading}
                      className="min-h-[48px] rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950"
                    >
                      {replyLoading ? "Generating..." : "Generate reply options"}
                    </button>

                    <button
                      onClick={clearReplyTool}
                      className="min-h-[48px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-white/90 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                    >
                      Clear replies
                    </button>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <ResultPanel
                  title="Improved reply"
                  content={improvedReply}
                  onCopy={() => copyText(improvedReply)}
                  isCopied={copiedText === improvedReply}
                  empty="Your upgraded reply will appear here."
                />

                <Card>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                      Reply suggestions
                    </h3>
                  </div>

                  <div className="mt-4 space-y-3">
                    {replySuggestions.length > 0 ? (
                      replySuggestions.map((reply, index) => (
                        <div
                          key={index}
                          className="rounded-[20px] border border-black/8 bg-slate-950/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.04]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[15px] leading-7 text-slate-900 dark:text-slate-100">
                              {reply}
                            </p>
                            <button
                              onClick={() => copyText(reply)}
                              className="min-h-[40px] rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-white/90 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                            >
                              {copiedText === reply ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm leading-7 text-[#73685c] dark:text-slate-300">
                        Two quick reply options will appear here after generation.
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </SectionShell>
        )}

        {activeTab === "career" && (
          <SectionShell
            eyebrow="Career preparation"
            title="Get direct answers for interviews, emails, SOPs, resumes, and GD"
            subtitle="Choose a career task, adjust the prompt, and get a final answer that is ready to use."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {careerTools.map((tool) => {
                const active = careerTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setCareerTool(tool.id)}
                    className={`rounded-[24px] border p-5 text-left transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.15)] dark:border-white dark:bg-slate-100 dark:text-slate-950"
                        : "border-black/8 bg-white/80 text-slate-900 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{tool.title}</h3>
                        <p
                          className={`mt-2 text-sm leading-7 ${
                            active
                              ? "text-white/85 dark:text-slate-700"
                              : "text-[#5f554b] dark:text-slate-300"
                          }`}
                        >
                          {tool.desc}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          active
                            ? "bg-white/15 text-white dark:bg-slate-200 dark:text-slate-950"
                            : "border border-black/10 bg-white text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-200"
                        }`}
                      >
                        {active ? "Selected" : "Use"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a6f63] dark:text-slate-300">
                      Selected tool
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-100">
                      {currentCareerTool.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setCareerPrompt(currentCareerTool.prompt)}
                    className="min-h-[44px] rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white/90 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                  >
                    Reset template
                  </button>
                </div>

                <div className="mt-5 space-y-2">
                  <FieldHeader
                    htmlFor="careerPrompt"
                    label="Career prompt"
                    micTarget="career"
                    hint="Ask exactly what you want the final answer to be."
                  />
                  <textarea
                    id="careerPrompt"
                    value={careerPrompt}
                    onChange={(e) => setCareerPrompt(e.target.value)}
                    rows={8}
                    className="w-full resize-y rounded-[24px] border border-black/10 bg-white px-4 py-4 text-[15px] leading-7 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 dark:border-white/15 dark:bg-black/20 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-white dark:focus:ring-white/10"
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={improveCareerPrompt}
                    disabled={!careerPrompt.trim() || careerLoading}
                    className="min-h-[48px] rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950"
                  >
                    {careerLoading ? "Getting answer..." : "Get final answer"}
                  </button>

                  <button
                    onClick={() => copyText(careerPrompt)}
                    disabled={!careerPrompt.trim()}
                    className="min-h-[48px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                  >
                    Copy prompt
                  </button>
                </div>
              </Card>

              <ResultPanel
                title="Career answer"
                content={careerResult}
                onCopy={() => copyText(careerResult)}
                isCopied={copiedText === careerResult}
                empty="The final output will appear here."
              />
            </div>
          </SectionShell>
        )}

        {activeTab === "voice" && (
          <SectionShell
            eyebrow="Voice and translation"
            title="Speak, correct, translate, and listen back"
            subtitle="Use voice input for rough English, Marathi-to-English translation, or English-to-Marathi conversion."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {[
                {
                  id: "speech-to-english" as VoiceMode,
                  title: "Speak to English",
                  desc: "Convert rough spoken English into natural English.",
                },
                {
                  id: "marathi-to-english" as VoiceMode,
                  title: "Marathi to English",
                  desc: "Translate Marathi speech or text into English.",
                },
                {
                  id: "english-to-marathi" as VoiceMode,
                  title: "English to Marathi",
                  desc: "Translate English speech or text into Marathi.",
                },
              ].map((item) => {
                const active = voiceMode === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setVoiceMode(item.id);
                      setVoiceResult("");
                      setVoiceError("");
                    }}
                    className={`rounded-[24px] border p-5 text-left transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.15)] dark:border-white dark:bg-slate-100 dark:text-slate-950"
                        : "border-black/8 bg-white/80 text-slate-900 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:bg-white/[0.08]"
                    }`}
                  >
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p
                      className={`mt-2 text-sm leading-7 ${
                        active
                          ? "text-white/85 dark:text-slate-700"
                          : "text-[#5f554b] dark:text-slate-300"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                      Input
                    </h3>
                    <p className="mt-1 text-xs text-[#73685c] dark:text-slate-300">
                      {voiceSupportChecked && voiceSupported
                        ? "Voice input supported in this browser."
                        : "Voice input works best in Chrome."}
                    </p>
                  </div>

                  <MicButton target="voice" label="voice input" />
                </div>

                <textarea
                  id="voiceInput"
                  value={voiceInput}
                  onChange={(e) => setVoiceInput(e.target.value)}
                  rows={10}
                  placeholder={getVoicePlaceholder(voiceMode)}
                  className="mt-4 min-h-[260px] w-full resize-y rounded-[24px] border border-black/10 bg-white px-4 py-4 text-[15px] leading-7 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 dark:border-white/15 dark:bg-black/20 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-white dark:focus:ring-white/10"
                />

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#73685c] dark:text-slate-300">
                  <span>
                    Input: {voiceMode === "marathi-to-english" ? "Marathi" : "English"}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-black/20 dark:bg-white/25" />
                  <span>
                    Output: {voiceMode === "english-to-marathi" ? "Marathi" : "English"}
                  </span>
                </div>

                {voiceError ? (
                  <div className="mt-4 rounded-[20px] border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300">
                    {voiceError}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={runVoiceTransform}
                    disabled={!voiceInput.trim() || voiceLoading}
                    className="min-h-[48px] rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950"
                  >
                    {voiceLoading ? "Processing..." : "Get result"}
                  </button>

                  <button
                    onClick={clearVoiceTool}
                    className="min-h-[48px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-white/90 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                  >
                    Clear
                  </button>
                </div>
              </Card>

              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                      Result
                    </h3>
                    <p className="mt-1 text-xs text-[#73685c] dark:text-slate-300">
                      Corrected or translated output
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        speakText(voiceResult, getSpeakLangFromMode(voiceMode))
                      }
                      disabled={!voiceResult.trim()}
                      className="min-h-[44px] rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                    >
                      Listen
                    </button>

                    <button
                      onClick={() => copyText(voiceResult)}
                      disabled={!voiceResult.trim()}
                      className="min-h-[44px] rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                    >
                      {copiedText === voiceResult ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 min-h-[340px] rounded-[24px] border border-black/8 bg-slate-950/[0.02] p-4 dark:border-white/10 dark:bg-black/20">
                  {voiceResult ? (
                    <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-900 dark:text-slate-100">
                      {voiceResult}
                    </p>
                  ) : (
                    <p className="text-sm leading-7 text-[#73685c] dark:text-slate-300">
                      Your corrected or translated result will appear here.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </SectionShell>
        )}

        {activeTab === "scenario" && (
          <SectionShell
            eyebrow="Guided role-play"
            title="Practice realistic chats with feedback after every turn"
            subtitle="Choose a scenario, reply naturally, and get corrections, a better alternative, and a short coaching report at the end."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {scenarioConfigs.map((scenario) => {
                const active = selectedScenarioId === scenario.id;

                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(scenario.id)}
                    className={`rounded-[24px] border p-5 text-left transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.15)] dark:border-white dark:bg-slate-100 dark:text-slate-950"
                        : "border-black/8 bg-white/80 text-slate-900 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{scenario.title}</h3>
                        <p
                          className={`mt-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                            active
                              ? "text-white/75 dark:text-slate-600"
                              : "text-[#7a6f63] dark:text-slate-300"
                          }`}
                        >
                          {scenario.toneLabel}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          active
                            ? "bg-white/15 text-white dark:bg-slate-200 dark:text-slate-950"
                            : "border border-black/10 bg-white text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-200"
                        }`}
                      >
                        {active ? "Selected" : "Use"}
                      </span>
                    </div>

                    <p
                      className={`mt-3 text-sm leading-7 ${
                        active
                          ? "text-white/85 dark:text-slate-700"
                          : "text-[#5f554b] dark:text-slate-300"
                      }`}
                    >
                      {scenario.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="p-0">
                <div className="border-b border-black/8 px-5 py-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                        {selectedScenario.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#5f554b] dark:text-slate-300">
                        {selectedScenario.subtitle}
                      </p>
                    </div>

                    <button
                      onClick={clearScenarioTool}
                      className="min-h-[44px] rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white/90 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                    >
                      Restart scenario
                    </button>
                  </div>
                </div>

                <div
                  ref={scenarioChatRef}
                  className="h-[520px] overflow-y-auto px-4 py-4 sm:px-5"
                >
                  <div className="space-y-4">
                    {scenarioMessages.map((message) => {
                      const isUser = message.role === "user";

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[92%] rounded-[24px] border p-4 ${
                              isUser
                                ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-slate-100 dark:text-slate-950"
                                : "border-black/8 bg-white dark:border-white/10 dark:bg-white/[0.05]"
                            }`}
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                                  isUser
                                    ? "bg-white/15 text-white dark:bg-slate-200 dark:text-slate-950"
                                    : "border border-black/10 bg-slate-950/[0.04] text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-200"
                                }`}
                              >
                                {isUser ? "You" : "Coach"}
                              </span>
                            </div>

                            <p className="whitespace-pre-wrap text-[15px] leading-7">
                              {message.text}
                            </p>

                            {!isUser && (message.correction || message.naturalAlternative || message.feedback) ? (
                              <div className="mt-4 space-y-3 rounded-[20px] border border-black/8 bg-slate-950/[0.03] p-3 dark:border-white/10 dark:bg-black/20">
                                {message.correction ? (
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a6f63] dark:text-slate-300">
                                      Corrected
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-900 dark:text-slate-100">
                                      {message.correction}
                                    </p>
                                  </div>
                                ) : null}

                                {message.naturalAlternative ? (
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a6f63] dark:text-slate-300">
                                      Natural alternative
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-900 dark:text-slate-100">
                                      {message.naturalAlternative}
                                    </p>
                                  </div>
                                ) : null}

                                {message.feedback ? (
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a6f63] dark:text-slate-300">
                                      Quick feedback
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-900 dark:text-slate-100">
                                      {message.feedback}
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}

                    {scenarioLoading ? (
                      <div className="flex justify-start">
                        <div className="rounded-[20px] border border-black/8 bg-white px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200">
                          Coach is thinking...
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="sticky bottom-0 rounded-b-[28px] border-t border-black/8 bg-[#f8f3eb]/90 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1425]/90 sm:px-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedScenario.chips.map((chip) => (
                        <SubtleChip
                          key={chip}
                          onClick={() => setScenarioInput(chip)}
                        >
                          {chip}
                        </SubtleChip>
                      ))}

                      {isFriendScenario &&
                        examEmojiSuggestions.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => addEmojiToScenario(emoji)}
                            className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-black/10 bg-white px-3.5 py-2 text-sm transition hover:bg-white/90 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                          >
                            {emoji}
                          </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                      <FieldHeader
                        htmlFor="scenarioInput"
                        label="Your reply"
                        micTarget="scenario"
                        hint="Send one message at a time and get feedback after each turn."
                      />
                      <textarea
                        ref={scenarioInputRef}
                        id="scenarioInput"
                        value={scenarioInput}
                        onChange={(e) => setScenarioInput(e.target.value)}
                        rows={4}
                        placeholder="Type your reply here..."
                        className="w-full resize-y rounded-[24px] border border-black/10 bg-white px-4 py-4 text-[15px] leading-7 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 dark:border-white/15 dark:bg-black/20 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-white dark:focus:ring-white/10"
                      />
                    </div>

                    {scenarioError ? (
                      <div className="rounded-[20px] border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300">
                        {scenarioError}
                      </div>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => sendScenarioMessage()}
                        disabled={!scenarioInput.trim() || scenarioLoading}
                        className="min-h-[48px] rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950"
                      >
                        {scenarioLoading ? "Sending..." : "Send message"}
                      </button>

                      <button
                        onClick={endScenarioAndGenerateReport}
                        disabled={scenarioMessages.length < 2 || scenarioReportLoading}
                        className="min-h-[48px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                      >
                        {scenarioReportLoading ? "Generating report..." : "End session"}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <Card>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                    Scenario focus
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5f554b] dark:text-slate-300">
                    {selectedScenario.reportFocus}
                  </p>

                  <div className="mt-4 rounded-[20px] border border-black/8 bg-slate-950/[0.03] p-4 dark:border-white/10 dark:bg-black/20">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a6f63] dark:text-slate-300">
                      Role
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-900 dark:text-slate-100">
                      {selectedScenario.role}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                      Session report
                    </h3>
                    {scenarioReport ? (
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-200">
                        Tone {scenarioReport.toneScore}/10
                      </span>
                    ) : null}
                  </div>

                  {scenarioReport ? (
                    <div className="mt-4 space-y-5">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a6f63] dark:text-slate-300">
                          Mistakes summary
                        </p>
                        <ul className="mt-2 space-y-2">
                          {scenarioReport.mistakesSummary.map((item, index) => (
                            <li
                              key={index}
                              className="rounded-[18px] border border-black/8 bg-slate-950/[0.03] px-3 py-2 text-sm leading-7 text-slate-900 dark:border-white/10 dark:bg-black/20 dark:text-slate-100"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a6f63] dark:text-slate-300">
                          Better phrases
                        </p>
                        <ul className="mt-2 space-y-2">
                          {scenarioReport.betterPhrases.map((item, index) => (
                            <li
                              key={index}
                              className="rounded-[18px] border border-black/8 bg-slate-950/[0.03] px-3 py-2 text-sm leading-7 text-slate-900 dark:border-white/10 dark:bg-black/20 dark:text-slate-100"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-[20px] border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a6f63] dark:text-slate-300">
                          Overall feedback
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-900 dark:text-slate-100">
                          {scenarioReport.overallFeedback}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-[#73685c] dark:text-slate-300">
                      Finish a scenario to see mistakes, better phrases, and your tone score.
                    </p>
                  )}
                </Card>
              </div>
            </div>
          </SectionShell>
        )}
      </div>
    </main>
  );
}