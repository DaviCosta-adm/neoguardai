"use client";

import { motion } from "framer-motion";


const stats = [
  {
    title: "Risk Detection",
    value: "Antecipação",
    description:
      "Identificação precoce de estudantes com sinais de risco de evasão.",
  },
  {
    title: "Case Focus",
    value: "Prioridade",
    description:
      "Alertas e casos organizados para a coordenação agir com foco.",
  },
  {
    title: "Action Tracking",
    value: "Contínuo",
    description:
      "Acompanhamento de intervenções e evolução do risco ao longo do tempo.",
  },
];



export default function Dashboard() {


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

          Dashboard Intelligence

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

          Dados inteligentes

          <br />

          em tempo real.

        </h2>





        <p
          className="
            mt-6
            max-w-xl
            text-base
            leading-7
            text-gray-400
            md:text-lg
          "
        >

          O NeoGuardAI transforma indicadores educacionais em
          alertas, análises e ações preventivas contra a evasão.

        </p>



      </motion.div>









      {/* Painel */}
      <motion.div

        initial={{
          opacity:0,
          y:70,
          scale:0.96,
        }}

        whileInView={{
          opacity:1,
          y:0,
          scale:1,
        }}

        transition={{
          duration:0.8,
        }}

        viewport={{
          once:false,
          amount:0.25,
        }}

        className="
          mt-12
          rounded-3xl
          border
          border-white/10
          bg-white/[0.03]
          p-5
          md:mt-16
          md:p-8
        "

      >




        <div
          className="
            grid
            gap-5
            md:grid-cols-3
          "
        >



          {stats.map((stat,index)=>(


            <motion.div

              key={stat.title}


              initial={{
                opacity:0,
                y:40,
              }}


              whileInView={{
                opacity:1,
                y:0,
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
                y:-6,
              }}


              className="
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-5
              "

            >



              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.25em]
                  text-gray-400
                "
              >

                {stat.title}

              </p>




              <h3
                className="
                  mt-4
                  text-4xl
                  font-black
                  sm:text-5xl
                "
              >

                {stat.value}

              </h3>





              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-gray-400
                "
              >

                {stat.description}

              </p>



            </motion.div>


          ))}


        </div>







        {/* Status */}
        <div
          className="
            mt-6
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-white/10
            bg-white/[0.02]
            px-4
            py-4
          "
        >

          <span
            className="
              h-2.5
              w-2.5
              rounded-full
              bg-cyan-400
              shadow-[0_0_15px_rgba(34,211,238,1)]
            "
          />


          <p
            className="
              text-sm
              text-gray-400
            "
          >

            NeoGuardAI System Online

          </p>


        </div>



      </motion.div>



    </section>

  );

}