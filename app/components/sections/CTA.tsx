"use client";

import { motion } from "framer-motion";


export default function CTA() {


  return (

    <section
      className="
        mx-auto
        max-w-7xl
        px-6
        py-24
        md:px-8
        md:py-32
      "
    >


      <motion.div

        initial={{
          opacity:0,
          y:60,
        }}

        whileInView={{
          opacity:1,
          y:0,
        }}

        transition={{
          duration:0.8,
        }}

        viewport={{
          once:false,
          amount:0.25,
        }}

        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-white/[0.03]
          px-6
          py-12
          text-center
          md:px-12
          md:py-20
        "

      >




        {/* Glow */}
        <div
          className="
            absolute
            left-1/2
            top-0
            -z-10
            h-64
            w-64
            -translate-x-1/2
            rounded-full
            bg-cyan-500/20
            blur-[100px]
          "
        />







        <h2
          className="
            text-4xl
            font-black
            leading-tight
            sm:text-5xl
            md:text-6xl
          "
        >

          Pronto para reduzir

          <br />

          a evasão escolar?

        </h2>







        <p
          className="
            mx-auto
            mt-6
            max-w-2xl
            text-base
            leading-7
            text-gray-400
            md:text-lg
          "
        >

          Descubra como a inteligência artificial pode
          antecipar riscos, orientar intervenções e fortalecer
          a permanência dos estudantes.

        </p>







        <motion.a

          href="#contato"

          whileHover={{
            scale:1.05,
          }}

          whileTap={{
            scale:0.97,
          }}

          className="
            mt-8
            inline-flex
            rounded-full
            bg-white
            px-8
            py-4
            text-sm
            font-semibold
            text-black
            md:text-base
          "

        >

          Falar com especialista

        </motion.a>





      </motion.div>


    </section>

  );

}