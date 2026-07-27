"use client";

import { SendHorizonal } from "lucide-react";

interface AtlasInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export default function AtlasInput({
  value,
  onChange,
  onSend,
  disabled = false,
}: AtlasInputProps) {

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      onSend();
    }
  }


  return (
    <div
      className="
        border-t
        border-white/10
        p-2
      "
    >

      <div
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-white/10
          bg-white/5
          px-3
          py-1.5
        "
      >

        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) =>
            onChange(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Pergunte ao Atlas..."
          className="
            flex-1
            bg-transparent
            text-xs
            text-white
            placeholder:text-gray-500
            outline-none
          "
        />


        <button
          onClick={onSend}
          disabled={
            disabled || !value.trim()
          }
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-cyan-500
            text-black
            transition
            hover:scale-105
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >

          <SendHorizonal size={15} />

        </button>


      </div>

    </div>
  );
}