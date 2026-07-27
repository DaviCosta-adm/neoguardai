"use client";

import { motion } from "framer-motion";

interface AtlasTypingProps {
  visible: boolean;
}

export default function AtlasTyping({
  visible,
}: AtlasTypingProps) {

  if (!visible) return null;


  return (
    <motion.div

      initial={{
        opacity: 0,
        y: 5,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      exit={{
        opacity: 0,
      }}

      className="
        flex
        items-center
        gap-2
        px-4
        py-2
      "

    >

      <span
        className="
          text-[11px]
          font-medium
          text-cyan-400
        "
      >
        Atlas está pensando
      </span>


      <div
        className="
          flex
          gap-1
        "
      >

        {[0, 1, 2].map((dot) => (

          <motion.span

            key={dot}

            animate={{
              y: [0, -3, 0],
              opacity: [0.4, 1, 0.4],
            }}

            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: dot * 0.15,
            }}

            className="
              h-1.5
              w-1.5
              rounded-full
              bg-cyan-400
            "

          />

        ))}

      </div>

    </motion.div>
  );
}