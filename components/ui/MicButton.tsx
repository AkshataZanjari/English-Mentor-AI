import React, { useState, useRef, useEffect } from "react";
import { Button } from "./Button";

interface SpeechRecognitionEvent {
  results: {
    length: number;
    [index: number]: {
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
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface MicButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

export function MicButton({ onResult, className = "" }: MicButtonProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  function toggleMic() {
    if (listening) {
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
      alert("Voice input is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionImpl();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i += 1) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) onResult(transcript);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setListening(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={`!p-2 text-xl ${listening ? "text-red-500 bg-red-500/10" : "text-slate-400"} ${className}`}
      onClick={toggleMic}
      title="Voice Input"
    >
      🎤
    </Button>
  );
}
