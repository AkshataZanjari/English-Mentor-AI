"use client";
import { useState } from "react";
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


  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or speak a sentence to rewrite..."
              className="h-32 pr-12"
            />
              <MicButton text={text} onTextUpdate={setText} />
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <Button
                  key={t.value}
                  variant={tone === t.value ? "primary" : "ghost"}
                  onClick={() => setTone(t.value)}
                  className="text-xs py-1.5 px-3"
                >
                  {t.label}
                </Button>
              ))}
            </div>
            <Button onClick={rewriteTone} disabled={loading || !text.trim()}>
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
                className="text-xs py-1"
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
