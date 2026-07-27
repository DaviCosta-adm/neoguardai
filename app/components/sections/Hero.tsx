"use client";

import { motion } from "framer-motion";
import MetricCard from "../ui/MetricCard";

export default function Hero() {
  return (
    <section
className="
relative
mx-auto
flex
min-h-screen
max-w-7xl
items-center
px-5
pt-24
sm:px-6
md:px-8
"
>
      <div
        className="
          grid
          w-full
          items-center
          gap-12
          lg:grid-cols-1
        "
      >
        {/* Texto */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="
            text-center
            lg:text-left
          "
        >
          <p
            className="
              text-xs
              uppercase
              tracking-[0.35em]
              text-cyan-400
              md:text-sm
            "
          >
            NeoGuardAI System
          </p>

          <h1
            className="
              mt-5
              text-4xl
              font-black
              leading-tight
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
            "
          >
            Inteligência artificial

            <br />

            para ambientes mais seguros.
          </h1>

          <p
            className="
              mx-auto
              mt-6
              max-w-xl
              text-base
              leading-7
              text-gray-400
              md:text-lg
              lg:mx-0
            "
          >
            Uma nova geração de segurança utilizando inteligência
            artificial, análise preditiva e o poder do Atlas.
          </p>

          <motion.a
            href="#contato"
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="
              mt-8
              inline-flex
              rounded-full
              bg-white
              px-7
              py-3.5
              text-sm
              font-semibold
              text-black
              md:text-base
            "
          >
            Começar projeto
          </motion.a>

          {/* Métricas */}
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
              duration: 0.8,
            }}
            className="
              mt-12
              grid
              grid-cols-2
              gap-4
              lg:grid-cols-4
            "
          >
            <MetricCard
            value="99.8%"
           label="Precisão IA"
/>

           <MetricCard
            value="24/7"
         label="Monitoramento"
/>

         <MetricCard
       value="<0.2s"
       label="Resposta"
/>

          <MetricCard
        value="100%"
           label="Proteção"
/>
          </motion.div>
        </motion.div>

      
      </div>
    </section>
  );
}