"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function GrammarChecker() {
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function checkGrammar() {
    if (!sentence.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/grammar-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setResult({
          isCorrect: false,
          correctedSentence: sentence,
          explanation: data.error || "An error occurred while checking grammar.",
          mistakes: [],
        });
      } else {
        setResult(data);
      }
    } catch (err) {
      setResult({
        isCorrect: false,
        correctedSentence: sentence,
        explanation: "Network error. Please try again.",
        mistakes: [],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto">
      <textarea
        value={sentence}
        onChange={(e) => setSentence(e.target.value)}
        placeholder="Type any English sentence..."
        className="w-full h-24 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      <button
        onClick={checkGrammar}
        disabled={loading}
        className="mt-3 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
      >
        {loading ? "Checking..." : "Check Grammar"}
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-3"
        >
          <p><strong>Status:</strong> {result.isCorrect ? "✅ Correct" : "❌ Incorrect"}</p>
          <p><strong>Corrected:</strong> {result.correctedSentence}</p>
          {result.mistakes?.length > 0 && (
            <div>
              <strong>Mistakes:</strong>
              <ul className="list-disc list-inside">
                {result.mistakes.map((m: string, i: number) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
          <p><strong>Explanation:</strong> {result.explanation}</p>
          {result.rule && <p><strong>Rule:</strong> {result.rule}</p>}
          {result.similarExamples?.length > 0 && (
            <div>
              <strong>Similar Examples:</strong>
              <ul className="list-disc list-inside">
                {result.similarExamples.map((ex: string, i: number) => <li key={i}>{ex}</li>)}
              </ul>
            </div>
          )}
          {result.practiceQuestion && (
            <p><strong>Practice:</strong> {result.practiceQuestion} (Answer: {result.practiceAnswer})</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
