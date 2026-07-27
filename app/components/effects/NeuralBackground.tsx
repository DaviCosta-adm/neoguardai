"use client";

export default function NeuralBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

      {/* Glow central otimizado */}
      <div
        className="
          absolute
          left-1/2
          top-1/3
          h-[450px]
          w-[450px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-500/10
          blur-[80px]
        "
      />


      {/* Rede neural */}
      <div
        className="
          absolute
          inset-0
          opacity-40
          bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06)_1px,transparent_1px)]
          bg-[length:45px_45px]
        "
      />


    </div>
  );
}