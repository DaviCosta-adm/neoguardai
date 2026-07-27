"use client";

import { Mic, MicOff } from "lucide-react";

interface AtlasSpeechProps {
  listening?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}

export default function AtlasSpeech({
  listening = false,
  onToggle,
  disabled = false,
}: AtlasSpeechProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={
        listening
          ? "Parar reconhecimento de voz"
          : "Iniciar reconhecimento de voz"
      }
      className={`
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        transition-all
        duration-200

        ${
          listening
            ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
            : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
        }

        disabled:cursor-not-allowed
        disabled:opacity-40
      `}
    >
      {listening ? (
        <MicOff size={18} />
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
}