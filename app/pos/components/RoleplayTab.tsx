"use client";
import { useState, useEffect, useRef } from "react";
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
      const transcript = newMessages.map((m) => `${m.role === "assistant" ? "Tutor" : "User"}: ${m.text}`).join("\n");
      const prompt = `${activeScenario.systemPrompt}\nScenario:\n${activeScenario.title}\nTranscript so far:\n${transcript}\nLatest message:\n${text}`;
      
      const response = await fetch("/api/pos/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt, tone: "professional" }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Failed to respond");
      
      const parsed = JSON.parse(payload.data.result);
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
      const transcript = messages.map((m) => `${m.role === "assistant" ? "Tutor" : "User"}: ${m.text}`).join("\n");
      const prompt = `You are an English speaking coach. Analyze this transcript and create a report. Return JSON with mistakesSummary (array of 3 strings), betterPhrases (array of 3 strings), toneScore (1-10), and overallFeedback.\n\nTranscript:\n${transcript}`;
      
      const response = await fetch("/api/pos/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt, tone: "professional" }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Failed to generate report");
      
      setReport(JSON.parse(payload.data.result));
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to generate report.");
    } finally {
      setReportLoading(false);
    }
  }



  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {scenarioConfigs.map((sc) => (
          <Button
            key={sc.id}
            variant={scenarioId === sc.id ? "primary" : "outline"}
            onClick={() => setScenarioId(sc.id)}
            className="text-xs py-1.5 px-3 whitespace-nowrap"
          >
            {sc.title}
          </Button>
        ))}
      </div>

      <Card className="flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${m.role === "user" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-100"}`}>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
              {m.role === "assistant" && m.correction && (
                <div className="mt-2 ml-2 max-w-[85%] text-xs space-y-1">
                  {m.correction && m.correction !== messages[messages.length-2]?.text && (
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
              <div className="bg-slate-800 text-slate-400 rounded-2xl p-4 max-w-[85%]">Typing...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          {activeScenario.chips.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
            <div className="flex flex-wrap gap-2">
              {activeScenario.chips.map((chip, i) => (
                <Button key={i} variant="outline" className="text-xs py-1" onClick={() => sendMessage(chip)}>{chip}</Button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your reply..."
                className="pr-12"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
                <MicButton text={input} onTextUpdate={setInput} />
            </div>
            <div className="flex flex-col justify-between gap-2">
              <Button onClick={() => sendMessage()} disabled={loading || !input.trim()}>Send</Button>
              <Button variant="secondary" onClick={generateReport} disabled={reportLoading || messages.length < 2}>
                {reportLoading ? "Analyzing..." : "End & Grade"}
              </Button>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
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
