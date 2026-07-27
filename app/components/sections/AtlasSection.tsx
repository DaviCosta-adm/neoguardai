"use client";

import { motion } from "framer-motion";
import Atlas from "../atlas/AtlasAvatar";


const modules = [
  {
    title: "Neural Core",
    description:
      "Processamento inteligente capaz de aprender e evoluir continuamente.",
    status: "ACTIVE",
  },
  {
    title: "Smart Vision",
    description:
      "Análise avançada de ambientes escolares em tempo real.",
    status: "ONLINE",
  },
  {
    title: "Rapid Response",
    description:
      "Tomada de decisão rápida para auxiliar situações importantes.",
    status: "READY",
  },
];


export default function AtlasSection() {

  return (

    <section
      className="
        relative
        mx-auto
        flex
        min-h-screen
        max-w-7xl
        items-center
        px-6
        py-24
        md:px-8
      "
    >


      <div
        className="
          grid
          w-full
          items-center
          gap-12
          lg:grid-cols-2
        "
      >





        {/* Texto */}
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

            Conheça o Atlas

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

            O cérebro inteligente

            <br />

            por trás da segurança.

          </h2>







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

            Atlas é a inteligência artificial do NeoGuardAI.
            Ele combina análise inteligente, monitoramento
            avançado e tecnologia preditiva para transformar
            escolas em ambientes mais seguros.

          </p>








          {/* Cards */}
          <div
            className="
              mt-10
              grid
              gap-4
              sm:grid-cols-3
            "
          >


            {modules.map((module,index)=>(


              <motion.div

                key={module.title}


                initial={{
                  opacity:0,
                  y:50,
                }}


                whileInView={{
                  opacity:1,
                  y:0,
                }}


                transition={{
                  duration:0.6,
                  delay:index * 0.15,
                }}


                viewport={{
                  once:false,
                  amount:0.25,
                }}


                whileHover={{
                  y:-8,
                }}


                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  p-5
                  text-left
                "
              >


                <span
                  className="
                    text-[10px]
                    tracking-[0.3em]
                    text-cyan-400
                  "
                >
                  {module.status}
                </span>




                <h3
                  className="
                    mt-4
                    font-semibold
                  "
                >
                  {module.title}
                </h3>





                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-gray-400
                  "
                >
                  {module.description}
                </p>


              </motion.div>


            ))}


          </div>


        </motion.div>









        {/* Atlas */}
        <motion.div

          initial={{
            opacity:0,
            x:50,
          }}

          whileInView={{
            opacity:1,
            x:0,
          }}

          transition={{
            duration:0.8,
          }}

          viewport={{
            once:false,
            amount:0.25,
          }}

          className="
            flex
            justify-center
          "

        >

          <div
            className="
              scale-75
              sm:scale-90
              md:scale-100
            "
          >

            <Atlas
              size="large"
            />

          </div>


        </motion.div>





      </div>


    </section>

  );

}