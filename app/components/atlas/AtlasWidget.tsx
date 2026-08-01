"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

import AtlasAvatar from "./AtlasAvatar";
import AtlasChat from "./AtlasChat";
import useAtlas from "./hooks/useAtlas";


export default function AtlasWidget() {

  const pathname = usePathname();
  const atlas = useAtlas();

  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/login")
  ) {
    return null;
  }


  return (

    <div
      className="
        fixed
        bottom-4
        right-4
        sm:bottom-6
        sm:right-6
        z-[999]
        flex
        flex-col
        items-end
      "
    >


      <AtlasChat atlas={atlas} />



      <motion.button

        onClick={atlas.toggleChat}

        whileHover={{
          scale: 1.05,
        }}

        whileTap={{
          scale: 0.95,
        }}

        animate={{
          y: [0, -4, 0],
        }}

        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}

        className="
          relative
          flex
          items-center
          justify-center
          outline-none
        "

      >

        {/* Atlas */}

        <div
  className="
    scale-75
    sm:scale-90
  "
>
  <AtlasAvatar
    size="normal"
    status={false}
  />
</div>





        {/* status online */}

        <motion.div

          animate={{
            scale:[1,1.25,1],
          }}

          transition={{
            duration:2,
            repeat:Infinity,
          }}

          className="
            absolute
            right-4
            top-4
            z-30
            h-4
            w-4
            rounded-full
            border-2
            border-[#050816]
            bg-cyan-400
          "

        />


      </motion.button>


    </div>

  );

}