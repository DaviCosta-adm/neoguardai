"use client";

import { motion } from "framer-motion";


const features = [
  {
    title: "AI Monitoring",
    description:
      "Monitoramento inteligente capaz de analisar ambientes escolares e identificar padrões importantes.",
    tag: "VISION SYSTEM",
  },
  {
    title: "Smart Alerts",
    description:
      "Alertas automáticos auxiliam equipes responsáveis com informações rápidas e precisas.",
    tag: "REAL TIME",
  },
  {
    title: "Predictive Analysis",
    description:
      "A inteligência artificial interpreta dados para antecipar possíveis situações.",
    tag: "AI ENGINE",
  },
  {
    title: "Secure Data",
    description:
      "Proteção avançada para manter informações organizadas e seguras.",
    tag: "SECURITY",
  },
];



export default function Features() {

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



      {/* Cabeçalho */}
      <motion.div

        initial={{
          opacity:0,
          y:50,
        }}

        whileInView={{
          opacity:1,
          y:0,
        }}

        transition={{
          duration:0.7,
        }}

        viewport={{
          once:false,
          amount:0.25,
        }}

        className="
          mx-auto
          max-w-3xl
          text-center
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

          Tecnologia NeoGuardAI

        </p>




        <h2
          className="
            mt-5
            text-4xl
            font-black
            leading-tight
            sm:text-5xl
            md:text-6xl
          "
        >

          Inteligência criada

          <br />

          para ambientes seguros.

        </h2>





        <p
          className="
            mt-6
            text-base
            leading-7
            text-gray-400
            md:text-lg
          "
        >

          Uma plataforma completa que une inteligência artificial,
          análise de dados e segurança para transformar escolas.

        </p>


      </motion.div>









      {/* Cards */}
      <div
        className="
          mt-12
          grid
          gap-5
          sm:grid-cols-2
          lg:mt-16
        "
      >



        {features.map((feature,index)=>(


          <motion.div

            key={feature.title}


            initial={{
              opacity:0,
              y:60,
              scale:0.96,
            }}


            whileInView={{
              opacity:1,
              y:0,
              scale:1,
            }}


            transition={{
              duration:0.6,
              delay:index * 0.12,
            }}


            viewport={{
              once:false,
              amount:0.25,
            }}


            whileHover={{
              y:-8,
              scale:1.02,
            }}


            className="
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-6
              md:p-8
            "

          >




            <div
              className="
                absolute
                inset-0
                bg-gradient-to-br
                from-cyan-400/10
                via-transparent
                to-purple-500/10
                opacity-0
                transition
                duration-500
                group-hover:opacity-100
              "
            />





            <div
              className="
                relative
              "
            >


              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <span
                  className="
                    h-3
                    w-3
                    rounded-full
                    bg-cyan-400
                    shadow-[0_0_15px_rgba(34,211,238,1)]
                  "
                />


                <span
                  className="
                    text-[10px]
                    tracking-[0.3em]
                    text-cyan-400
                  "
                >

                  {feature.tag}

                </span>


              </div>





              <h3
                className="
                  mt-6
                  text-xl
                  font-bold
                  md:text-2xl
                "
              >

                {feature.title}

              </h3>





              <p
                className="
                  mt-4
                  text-sm
                  leading-6
                  text-gray-400
                  md:text-base
                "
              >

                {feature.description}

              </p>


            </div>


          </motion.div>


        ))}


      </div>



    </section>

  );

}