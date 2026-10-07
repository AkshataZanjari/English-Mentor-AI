"use client";
import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MicButton } from "@/components/ui/MicButton";
import { ToneType } from "../config";

export function RewriteTab() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState<ToneType>("professional");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, userId } = useAuth();

  const tones: { value: ToneType; label: string }[] = [
    { value: "casual", label: "Casual" },
    { value: "professional", label: "Professional" },
  ];

  async function rewriteTone() {
    if (!text.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setResult("");

      const response = await fetch("/api/pos/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Request failed");
      }
      setResult(payload.data.result || "No result returned.");
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
        <h2 className="text-xl font-semibold mb-2 text-slate-200">Sign in to use Rewrite AI</h2>
        <p className="text-slate-400 mb-6">Create an account to quickly rewrite your text professionally.</p>
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
          <div className="relative">
            <Textarea
              aria-label="Text to rewrite"
              maxLength={1000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or speak a sentence to rewrite..."
              className="h-32 pr-12"
            />
              <MicButton text={text} onTextUpdate={setText} className="absolute right-2 top-2" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex w-full sm:w-auto bg-slate-950 p-1 rounded-lg border border-slate-800">
              {tones.map((t) => (
                <Button
                  key={t.value}
                  variant={tone === t.value ? "secondary" : "ghost"}
                  onClick={() => setTone(t.value)}
                  className="flex-1 sm:flex-none text-xs min-h-[44px] sm:min-h-0 sm:py-1.5 px-3 rounded-md transition-colors"
                >
                  {t.label}
                </Button>
              ))}
            </div>
            <Button onClick={rewriteTone} disabled={loading || !text.trim()} className="w-full sm:w-auto">
              {loading ? "Rewriting..." : "Rewrite"}
            </Button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </Card>

      {result && (
        <Card>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-400">Rewritten Text:</h3>
              <Button 
                variant="ghost" 
                className="text-xs min-h-[44px] sm:min-h-0 sm:py-1"
                onClick={() => navigator.clipboard.writeText(result)}
              >
                Copy
              </Button>
            </div>
            <p className="text-lg text-slate-100 whitespace-pre-wrap">{result}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
