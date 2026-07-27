"use client";

import { motion } from "framer-motion";


const partners = [
  "EDUCATION",
  "SECURITY",
  "TECHNOLOGY",
  "AI RESEARCH",
];



export default function TrustedBy() {


  return (

    <section
      className="
        mx-auto
        max-w-7xl
        px-6
        py-24
        md:px-8
      "
    >




      {/* Título */}
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

          Trusted Technology

        </p>





        <h2
          className="
            mt-5
            text-4xl
            font-black
            leading-tight
            sm:text-5xl
          "
        >

          Tecnologia criada para

          <br />

          ambientes inteligentes.

        </h2>



      </motion.div>








      {/* Cards */}
      <div
        className="
          mt-10
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          md:mt-12
          lg:grid-cols-4
        "
      >



        {partners.map((partner,index)=>(


          <motion.div


            key={partner}


            initial={{
              opacity:0,
              y:50,
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
              scale:1.03,
            }}


            className="
              flex
              h-28
              items-center
              justify-center
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              px-5
            "

          >



            <span
              className="
                text-center
                text-xs
                font-semibold
                tracking-[0.25em]
                text-gray-300
              "
            >

              {partner}

            </span>



          </motion.div>


        ))}


      </div>


    </section>

  );

}