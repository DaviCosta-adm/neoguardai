"use client";

import { motion } from "framer-motion";

export default function SectionTransition() {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      transition={{
        duration: 1,
      }}
      viewport={{
        once: true,
      }}
      className="
        relative
        h-32
        w-full
        overflow-hidden
      "
    >

      <div
        className="
          absolute
          left-1/2
          top-1/2
          h-40
          w-[500px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-400/10
          blur-[80px]
        "
      />


      <div
        className="
          absolute
          left-0
          right-0
          top-1/2
          h-px
          bg-gradient-to-r
          from-transparent
          via-cyan-400/30
          to-transparent
        "
      />

    </motion.div>
  );
}