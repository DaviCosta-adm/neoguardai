"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AtlasAvatar({
  size = "normal",
  status = true,
}: {
  size?: "normal" | "large";
  status?: boolean;
}) {
  return (
    <div
      className="
        relative
        flex
        items-center
        justify-center
      "
    >

      {/* personagem */}

      <motion.div
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >

        <Image
          src="/images/atlas.png"
          alt="Atlas - Assistente NeoGuardAI"

          width={
            size === "large"
              ? 420
              : 100
          }

          height={
            size === "large"
              ? 540
              : 130
          }

          priority

          className="
            relative
            z-10
            object-contain
          "
        />

      </motion.div>


      {/* status online */}

      {status && (

        <div
          className="
            absolute
            bottom-3
            right-0
            hidden
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-3
            py-2
            backdrop-blur-md
            md:block
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <span
              className="
                h-2.5
                w-2.5
                rounded-full
                bg-cyan-400
              "
            />

            <p className="text-xs text-white">
              Atlas Online
            </p>

          </div>

        </div>

      )}

    </div>
  );
}