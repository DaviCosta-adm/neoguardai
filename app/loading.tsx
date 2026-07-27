"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Loading() {

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);


  if (!visible) return null;


  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.4, duration: 0.4 }}
      className="
        fixed
        inset-0
        z-[999]
        flex
        flex-col
        items-center
        justify-center
        bg-[#050816]
      "
    >

      <motion.div
        animate={{
          scale:[1,1.05,1],
        }}
        transition={{
          duration:2,
          repeat:Infinity,
        }}
      >

        <Image
          src="/images/atlas.png"
          alt="Atlas"
          width={180}
          height={260}
          priority
          className="object-contain"
        />

      </motion.div>


      <h1 className="
        mt-6
        text-3xl
        font-black
        text-white
      ">
        Atlas
      </h1>


      <p className="
        mt-2
        text-sm
        text-gray-400
      ">
        Assistente inteligente NeoGuardAI online...
      </p>


      <div
        className="
          mt-8
          h-1
          w-[180px]
          rounded-full
          bg-cyan-400
        "
      />

    </motion.div>
  );
}