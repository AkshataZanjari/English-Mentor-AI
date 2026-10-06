import React, { useState, useRef, useEffect } from "react";
import { Button } from "./Button";

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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const initialTextRef = useRef("");
  const finalTranscriptRef = useRef("");
  const retryCountRef = useRef(0);

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
    if (!SpeechRecognitionImpl) {
      alert("Voice input works in Chrome or Edge.");
      return;
    }

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
        retryCountRef.current = 0;
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const spoken = finalTranscriptRef.current + interimTranscript;
        const base = initialTextRef.current;
        const newText = base ? base + (base.endsWith(" ") ? "" : " ") + spoken : spoken;
        onTextUpdate(newText);
      };

      recognition.onerror = (event: { error: string }) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          alert("Microphone permission is blocked. Allow it in your browser's address bar.");
          shouldKeepListeningRef.current = false;
        } else if (event.error === "audio-capture") {
          alert("No microphone found.");
          shouldKeepListeningRef.current = false;
        } else if (event.error === "network") {
          alert("Voice recognition needs an internet connection.");
          shouldKeepListeningRef.current = false;
        }
        // no-speech is ignored, it will just end and restart if needed
      };

      recognition.onend = () => {
        if (shouldKeepListeningRef.current && retryCountRef.current < 5) {
          retryCountRef.current += 1;
          setTimeout(() => {
            if (shouldKeepListeningRef.current) {
              startRecognition(SpeechRecognitionImpl);
            }
          }, 300);
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
    <Button
      type="button"
      variant="ghost"
      className={`!p-2 text-xl ${listening ? "text-red-500 bg-red-500/10 animate-pulse" : "text-slate-400"} ${className}`}
      onClick={toggleMic}
      title={listening ? "Click the mic again to stop" : "Voice Input"}
    >
      {listening ? "🔴" : "🎤"}
    </Button>
  );
}
