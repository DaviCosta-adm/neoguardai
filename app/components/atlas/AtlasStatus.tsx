"use client";

interface AtlasStatusProps {
  status?: "online" | "typing" | "offline";
}

export default function AtlasStatus({
  status = "online",
}: AtlasStatusProps) {
  const config = {
    online: {
      color: "bg-emerald-400",
      text: "Online",
    },
    typing: {
      color: "bg-cyan-400 animate-pulse",
      text: "Pensando...",
    },
    offline: {
      color: "bg-red-500",
      text: "Offline",
    },
  };

  const current = config[status];

  return (
    <div className="flex items-center gap-2">
      <span
        className={`
          h-2.5
          w-2.5
          rounded-full
          ${current.color}
        `}
      />

      <span className="text-xs text-gray-400">
        {current.text}
      </span>
    </div>
  );
}