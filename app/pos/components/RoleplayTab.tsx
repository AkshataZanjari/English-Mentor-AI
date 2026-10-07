"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MicButton } from "@/components/ui/MicButton";
import { Badge } from "@/components/ui/Badge";
import { ScenarioId, scenarioConfigs, ScenarioMessage, ScenarioReport } from "../config";

export function RoleplayTab() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("hr-interview");
  const [messages, setMessages] = useState<ScenarioMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ScenarioReport | null>(null);
  const { isLoaded, userId } = useAuth();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeScenario = scenarioConfigs.find((s) => s.id === scenarioId) || scenarioConfigs[0];

  useEffect(() => {
    startScenario();
  }, [scenarioId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function startScenario() {
    setMessages([{ id: crypto.randomUUID(), role: "assistant", text: activeScenario.starter }]);
    setInput("");
    setError(null);
    setReport(null);
  }

  async function sendMessage(textOverride?: string) {
    const text = (textOverride || input).trim();
    if (!text) return;
    
    const userMsg: ScenarioMessage = { id: crypto.randomUUID(), role: "user", text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setError(null);

    try {
      setLoading(true);
      const response = await fetch("/api/pos/roleplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          action: "turn",
          messages: newMessages.map((m) => ({ role: m.role, text: m.text }))
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Failed to respond");
      
      const parsed = payload.data;
      const asstMsg: ScenarioMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: parsed.assistantReply,
        correction: parsed.correction,
        naturalAlternative: parsed.naturalAlternative,
        feedback: parsed.feedback,
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function generateReport() {
    if (messages.length < 2) return;
    try {
      setReportLoading(true);
      setError(null);
      const response = await fetch("/api/pos/roleplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          action: "report",
          messages: messages.map((m) => ({ role: m.role, text: m.text }))
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Failed to generate report");
      
      setReport(payload.data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to generate report.");
    } finally {
      setReportLoading(false);
    }
  }



  if (!isLoaded) return <div className="animate-pulse h-32 bg-slate-800 rounded-xl"></div>;
  if (!userId) {
    return (
      <Card className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2 text-slate-200">Sign in to use Roleplay AI</h2>
        <p className="text-slate-400 mb-6">Create an account to practice speaking in realistic scenarios.</p>
        <SignInButton mode="modal">
          <Button variant="primary">Sign In</Button>
        </SignInButton>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto snap-x scrollbar-none md:flex-wrap pb-2">
          {scenarioConfigs.map((sc) => (
            <Button
              key={sc.id}
              variant={scenarioId === sc.id ? "primary" : "outline"}
              onClick={() => setScenarioId(sc.id)}
              className="text-xs min-h-[44px] sm:min-h-0 sm:py-1.5 px-3 shrink-0 whitespace-nowrap snap-start"
            >
              {sc.title}
            </Button>
          ))}
        </div>
        <p className="text-sm text-slate-400">{activeScenario.subtitle}</p>
      </div>

      <Card className="flex flex-col h-[70vh] sm:h-[600px]">
        {/* Header Row */}
        <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-800">
          <h3 className="font-semibold text-slate-200">{activeScenario.title}</h3>
          <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={generateReport} disabled={reportLoading || messages.length < 2}>
            {reportLoading ? "Analyzing..." : "End & Grade"}
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-none">
          {messages.map((m, index) => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 sm:p-4 ${m.role === "user" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-100"}`}>
                <p className="whitespace-pre-wrap text-sm sm:text-base">{m.text}</p>
              </div>
              {m.role === "assistant" && m.correction && (
                <div className="mt-2 ml-2 max-w-[85%] text-xs space-y-1">
                  {m.correction && m.correction !== messages[index - 1]?.text && (
                    <p className="text-slate-400">Grammar: <span className="text-slate-200">{m.correction}</span></p>
                  )}
                  {m.naturalAlternative && (
                    <p className="text-slate-400">Better: <span className="text-green-400">{m.naturalAlternative}</span></p>
                  )}
                  {m.feedback && (
                    <p className="text-purple-400 italic">"{m.feedback}"</p>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start">
              <div className="bg-slate-800 text-slate-400 rounded-2xl p-3 max-w-[85%] text-sm">Typing...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestions Row */}
        {activeScenario.chips.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
          <div className="flex gap-2 overflow-x-auto snap-x scrollbar-none pb-2 mb-2">
            {activeScenario.chips.map((chip, i) => (
              <Button key={i} variant="outline" className="text-xs min-h-[44px] sm:min-h-0 sm:py-1 shrink-0 snap-start" onClick={() => sendMessage(chip)}>{chip}</Button>
            ))}
          </div>
        )}

        {/* Input Row */}
        <div className="relative pt-2 border-t border-slate-800 mt-auto">
          <Textarea
            aria-label="Type your reply"
            maxLength={1000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your reply..."
            className="pr-12 pb-10 min-h-[4rem]"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <MicButton text={input} onTextUpdate={setInput} className="absolute right-2 top-4" />
          <Button
            className="absolute right-2 bottom-3 px-3 py-1 text-xs"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            Send
          </Button>
          {error && <p className="text-red-400 text-xs mt-1 absolute -bottom-5">{error}</p>}
        </div>
      </Card>

      {report && (
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">Feedback Report</h3>
            <Badge variant="primary">Score: {report.toneScore}/10</Badge>
          </div>
          <p className="text-slate-300">{report.overallFeedback}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-semibold text-red-400 mb-2">Areas to Improve:</h4>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                {report.mistakesSummary.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-semibold text-green-400 mb-2">Better Phrases to Use:</h4>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                {report.betterPhrases.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
