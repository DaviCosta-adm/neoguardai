"use client";

import { motion } from "framer-motion";

type MetricCardProps = {
  value: string;
  label: string;
};

export default function MetricCard({
  value,
  label,
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 18,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        px-6
        py-5
        backdrop-blur-md
        transition-all
        duration-300
        hover:border-cyan-400/40
        hover:shadow-[0_0_35px_rgba(34,211,238,0.15)]
      "
    >
      {/* brilho superior */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-cyan-400/70
          to-transparent
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      <h3
        className="
          text-3xl
          font-black
          text-white
        "
      >
        {value}
      </h3>

      <p
        className="
          mt-2
          text-sm
          text-gray-400
        "
      >
        {label}
      </p>
    </motion.div>
  );
}