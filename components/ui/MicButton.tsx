import React, { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { Button } from "./Button";
import { joinTranscriptSegments } from "@/lib/voice";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface MicButtonProps {
  text: string;
  onTextUpdate: (text: string) => void;
  className?: string;
}

export function MicButton({ text, onTextUpdate, className = "" }: MicButtonProps) {
  const [listening, setListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const supported = useSyncExternalStore(
    () => () => {},
    () => {
      const win = window as unknown as { SpeechRecognition?: unknown, webkitSpeechRecognition?: unknown };
      return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
    },
    () => true
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const initialTextRef = useRef("");
  const finalTranscriptRef = useRef("");
  const retryCountRef = useRef(0);
  const lastStartTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  function toggleMic() {
    if (!supported) return;
    if (listening) {
      shouldKeepListeningRef.current = false;
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    interface SpeechRecognitionConstructor {
      new (): SpeechRecognition;
    }
    const SpeechRecognitionImpl = (window as unknown as { SpeechRecognition: SpeechRecognitionConstructor, webkitSpeechRecognition: SpeechRecognitionConstructor }).SpeechRecognition || 
      (window as unknown as { SpeechRecognition: SpeechRecognitionConstructor, webkitSpeechRecognition: SpeechRecognitionConstructor }).webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) return;

    setErrorMsg("");
    initialTextRef.current = text;
    finalTranscriptRef.current = "";
    retryCountRef.current = 0;
    shouldKeepListeningRef.current = true;
    startRecognition(SpeechRecognitionImpl);
  }

  function startRecognition(SpeechRecognitionImpl: { new (): SpeechRecognition }) {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionImpl();
      recognition.lang = "en-IN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        lastStartTimeRef.current = Date.now();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current = joinTranscriptSegments(finalTranscriptRef.current, event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const spoken = joinTranscriptSegments(finalTranscriptRef.current, interimTranscript);
        const base = initialTextRef.current;
        const trimmedSpoken = spoken.trimStart();
        let newText = joinTranscriptSegments(base, trimmedSpoken);
        newText = newText.replace(/ {2,}/g, ' '); // collapse double spaces
        onTextUpdate(newText);
      };

      recognition.onerror = (event: { error: string }) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setErrorMsg("Microphone permission blocked.");
          shouldKeepListeningRef.current = false;
        } else if (event.error === "audio-capture") {
          setErrorMsg("No microphone found.");
          shouldKeepListeningRef.current = false;
        } else if (event.error === "network") {
          setErrorMsg("No internet connection.");
          shouldKeepListeningRef.current = false;
        }
      };

      recognition.onend = () => {
        if (shouldKeepListeningRef.current) {
          const duration = Date.now() - lastStartTimeRef.current;
          if (duration < 1500) {
            retryCountRef.current += 1;
          } else {
            retryCountRef.current = 0;
          }

          if (retryCountRef.current < 5) {
            setTimeout(() => {
              if (shouldKeepListeningRef.current) {
                startRecognition(SpeechRecognitionImpl);
              }
            }, 300);
          } else {
            setErrorMsg("No speech detected. Please try again.");
            setListening(false);
            shouldKeepListeningRef.current = false;
          }
        } else {
          setListening(false);
          shouldKeepListeningRef.current = false;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setListening(false);
      shouldKeepListeningRef.current = false;
    }
  }

  return (
    <div className={`flex flex-col items-end ${className}`}>
      <Button
        type="button"
        variant="ghost"
        disabled={!supported}
        aria-label={listening ? "Stop voice input" : "Start voice input"}
        aria-pressed={listening}
        className={`!p-2 text-xl min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center ${listening ? "text-red-500 bg-red-500/10 animate-pulse" : "text-slate-400"}`}
        onClick={toggleMic}
        title={!supported ? "Voice input works in Chrome or Edge" : listening ? "Click the mic again to stop" : "Voice Input"}
      >
        {listening ? "🔴" : "🎤"}
      </Button>
      {errorMsg && (
        <div aria-live="polite" className="absolute right-0 top-full mt-1 text-xs text-red-400 p-1.5 bg-slate-800 rounded shadow-lg z-10 whitespace-nowrap">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
