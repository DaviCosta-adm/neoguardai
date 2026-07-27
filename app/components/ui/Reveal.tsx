"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";


export default function Reveal({
  children,
}: {
  children: ReactNode;
}) {

  const ref = useRef(null);


  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [
      "start end",
      "end start",
    ],
  });



  const y = useTransform(
    scrollYProgress,
    [0,0.5,1],
    [80,0,-60]
  );


  const opacity = useTransform(
    scrollYProgress,
    [0,0.3,0.7,1],
    [0,1,1,0]
  );



  return (

    <motion.div

      ref={ref}

      style={{
        y,
        opacity,
      }}

    >

      {children}

    </motion.div>

  );
}