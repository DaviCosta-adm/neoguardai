"use client";

import { motion } from "framer-motion";
import type { Message } from "./hooks/useAtlas";

interface AtlasMessagesProps {
  messages: Message[];
}

export default function AtlasMessages({
  messages,
}: AtlasMessagesProps) {
  return (
    <div
      className="
        flex
        flex-1
        flex-col
        gap-2.5
        overflow-y-auto
        px-4
        py-3
      "
    >

      {messages.map((message) => (

        <motion.div

          key={message.id}

          initial={{
            opacity: 0,
            y: 6,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            duration: 0.2,
          }}


          className={`
            max-w-[82%]
            rounded-xl
            px-3
            py-2
            text-xs
            leading-5

            ${
              message.role === "assistant"
                ? `
                  self-start
                  bg-cyan-500/10
                  border
                  border-cyan-500/20
                  text-white
                `
                : `
                  self-end
                  bg-white/10
                  border
                  border-white/10
                  text-white
                `
            }
          `}
        >

          {message.content}

        </motion.div>

      ))}

    </div>
  );
}