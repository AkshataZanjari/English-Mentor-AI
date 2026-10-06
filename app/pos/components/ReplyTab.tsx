"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MicButton } from "@/components/ui/MicButton";

export function ReplyTab() {
  const [message, setMessage] = useState("");
  const [draftReply, setDraftReply] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [improvedReply, setImprovedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateReplies() {
    if (!message.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setSuggestions([]);
      setImprovedReply("");

      const response = await fetch("/api/pos/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, draftReply }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Request failed");
      }
      setSuggestions(payload.data.suggestions || []);
      setImprovedReply(payload.data.improvedReply || "");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleMicResultMsg(transcript: string) {
    setMessage((prev) => (prev ? prev + " " + transcript : transcript));
  }
  function handleMicResultDraft(transcript: string) {
    setDraftReply((prev) => (prev ? prev + " " + transcript : transcript));
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Message you received:</label>
            <div className="relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste the email or message you received..."
                className="h-24 pr-12"
              />
              <div className="absolute top-2 right-2">
                <MicButton onResult={handleMicResultMsg} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">What you want to say (optional rough notes):</label>
            <div className="relative">
              <Textarea
                value={draftReply}
                onChange={(e) => setDraftReply(e.target.value)}
                placeholder="I want to say yes, tomorrow at 10am..."
                className="h-20 pr-12"
              />
              <div className="absolute top-2 right-2">
                <MicButton onResult={handleMicResultDraft} />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={generateReplies} disabled={loading || !message.trim()}>
              {loading ? "Generating..." : "Generate Replies"}
            </Button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </Card>

      {(suggestions.length > 0 || improvedReply) && (
        <Card className="space-y-6">
          {improvedReply && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-purple-400">Improved Reply:</h3>
                <Button variant="ghost" className="text-xs py-1" onClick={() => navigator.clipboard.writeText(improvedReply)}>Copy</Button>
              </div>
              <div className="bg-purple-900/20 border border-purple-500/20 p-4 rounded-xl">
                <p className="text-slate-100 whitespace-pre-wrap">{improvedReply}</p>
              </div>
            </div>
          )}
          
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400">Alternative Options:</h3>
              <div className="grid gap-3">
                {suggestions.map((sug, i) => (
                  <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-start gap-4">
                    <p className="text-slate-200 text-sm whitespace-pre-wrap">{sug}</p>
                    <Button variant="ghost" className="text-xs shrink-0 py-1" onClick={() => navigator.clipboard.writeText(sug)}>Copy</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
