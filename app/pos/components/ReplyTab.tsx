"use client";
import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
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
  const { isLoaded, userId } = useAuth();

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



  if (!isLoaded) return <div className="animate-pulse h-32 bg-slate-800 rounded-xl"></div>;
  if (!userId) {
    return (
      <Card className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2 text-slate-200">Sign in to use Reply AI</h2>
        <p className="text-slate-400 mb-6">Create an account to generate professional replies to emails and messages.</p>
        <SignInButton mode="modal">
          <Button variant="primary">Sign In</Button>
        </SignInButton>
      </Card>
    );
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
                <MicButton text={message} onTextUpdate={setMessage} className="absolute right-2 top-2" />
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
                <MicButton text={draftReply} onTextUpdate={setDraftReply} className="absolute right-2 top-2" />
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
