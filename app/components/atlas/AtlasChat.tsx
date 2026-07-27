"use client";

import { AnimatePresence, motion } from "framer-motion";

import AtlasHeader from "./AtlasHeader";
import AtlasMessages from "./AtlasMessages";
import AtlasTyping from "./AtlasTyping";
import AtlasInput from "./AtlasInput";

import useAtlas from "./hooks/useAtlas";

interface AtlasChatProps {
  atlas: ReturnType<typeof useAtlas>;
}

export default function AtlasChat({
  atlas,
}: AtlasChatProps) {

  const {
    open,
    toggleChat,
    messages,
    input,
    setInput,
    typing,
    sendMessage,
  } = atlas;


  return (
    <AnimatePresence>

      {open && (

        <motion.div

          initial={{
            opacity: 0,
            y: 15,
            scale: 0.95,
          }}

          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}

          exit={{
            opacity: 0,
            y: 15,
            scale: 0.95,
          }}

          transition={{
            duration: 0.2,
          }}


          className="
            mb-4
            flex
            h-[390px]
            w-[290px]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-[#08101e]/95
            shadow-2xl
            backdrop-blur-xl

            sm:h-[420px]
            sm:w-[320px]
          "

        >

          <AtlasHeader onClose={toggleChat} />


          <AtlasMessages
            messages={messages}
          />


          <AtlasTyping
            visible={typing}
          />


          <AtlasInput
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            disabled={typing}
          />


        </motion.div>

      )}

    </AnimatePresence>
  );
}