"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";

export interface GrammarResult {
  isCorrect: boolean;
  correctedSentence: string;
  mistakes: string[];
  explanation: string;
  rule?: string;
  similarExamples?: string[];
  practiceQuestion?: string;
  practiceAnswer?: string;
  score?: number;
  scoreExplanation?: string;
}

export default function GrammarChecker() {
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkGrammar() {
    if (!sentence.trim()) return;
    setLoading(true);
    setError(null);
    setShowDetails(false);
    try {
      const res = await fetch("/api/grammar-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "An error occurred while checking grammar.");
        setResult(null);
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <Textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="Type any English sentence..."
            className="h-32"
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">{sentence.length}/1000</span>
            <Button onClick={checkGrammar} disabled={loading || !sentence.trim()}>
              {loading ? "Checking..." : "Check Grammar"}
            </Button>
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>
      </Card>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={result.isCorrect ? "success" : "error"} className="text-sm px-3 py-1">
                {result.isCorrect ? "✓ Correct" : "✗ Needs Work"}
              </Badge>
              {result.score !== undefined && (
                <Badge variant="neutral">Score: {result.score}/100</Badge>
              )}
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 mb-1">Corrected Sentence:</h3>
              <p className="text-lg font-medium text-slate-100">{result.correctedSentence}</p>
            </div>

            <Button 
              variant="ghost" 
              className="w-full justify-between"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide Details" : "Show Details"}
              <span className="text-xs">{showDetails ? "▲" : "▼"}</span>
            </Button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4 pt-2"
                >
                  {result.mistakes?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-1">Mistakes:</h4>
                      <ul className="list-disc list-inside text-sm text-slate-300">
                        {result.mistakes.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-1">Explanation:</h4>
                    <p className="text-sm text-slate-300">{result.explanation}</p>
                  </div>
                  
                  {result.rule && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-1">Rule:</h4>
                      <p className="text-sm text-slate-300">{result.rule}</p>
                    </div>
                  )}
                  
                  {(result.similarExamples?.length ?? 0) > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-1">Examples:</h4>
                      <ul className="list-disc list-inside text-sm text-slate-300">
                        {result.similarExamples!.map((ex, i) => <li key={i}>{ex}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {result.practiceQuestion && (
                    <div className="bg-purple-900/20 border border-purple-500/20 p-3 rounded-lg mt-2">
                      <h4 className="text-sm font-semibold text-purple-300 mb-1">Practice:</h4>
                      <p className="text-sm text-slate-200">{result.practiceQuestion}</p>
                      <p className="text-xs text-slate-400 mt-2">Answer: {result.practiceAnswer}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
