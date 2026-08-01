"use client";

import { motion } from "framer-motion";


export default function Footer() {


  const links = [
    {
      name:"Início",
      link:"#inicio",
    },
    {
      name:"Atlas",
      link:"#atlas",
    },
    {
      name:"Tecnologia",
      link:"#tecnologia",
    },
    {
      name:"Contato",
      link:"#contato",
    },
  ];



  return (

    <footer
      className="
        mx-auto
        max-w-7xl
        px-8
        pb-10
        pt-20
      "
    >



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
          border-t
          border-white/10
          pt-10
        "
      >





        <div
          className="
            grid
            gap-10
            md:grid-cols-3
          "
        >





          {/* Marca */}
          <div>


            <h3
              className="
                text-2xl
                font-black
              "
            >

              Neo
              <span
                className="
                  text-cyan-400
                "
              >
                GuardAI
              </span>


            </h3>




            <p
              className="
                mt-4
                max-w-sm
                text-sm
                leading-6
                text-gray-400
              "
            >

              Inteligência artificial criada para
              identificar risco de evasão e apoiar
              a coordenação com ações preventivas.

            </p>


          </div>








          {/* Navegação */}
          <div>


            <h4
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.3em]
                text-cyan-400
              "
            >

              Navegação

            </h4>





            <div
              className="
                mt-5
                flex
                flex-col
                gap-3
              "
            >

              {links.map((item)=>(


                <a

                  key={item.name}

                  href={item.link}

                  className="
                    text-sm
                    text-gray-400
                    transition
                    hover:text-white
                  "

                >

                  {item.name}

                </a>


              ))}


            </div>


          </div>









          {/* Status Atlas */}
          <div>


            <h4
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.3em]
                text-cyan-400
              "
            >

              Sistema

            </h4>





            <div
              className="
                mt-5
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-white/10
                bg-white/[0.03]
                px-5
                py-4
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



              <div>


                <p
                  className="
                    text-sm
                    font-semibold
                  "
                >

                  Atlas Online

                </p>


                <p
                  className="
                    text-xs
                    text-gray-400
                  "
                >

                  Sistema operacional

                </p>


              </div>


            </div>


          </div>





        </div>







        {/* Copyright */}
        <div
          className="
            mt-12
            border-t
            border-white/10
            pt-6
            text-center
            text-sm
            text-gray-500
          "
        >

          © {new Date().getFullYear()} NeoGuardAI.
          Todos os direitos reservados.

        </div>



      </motion.div>


    </footer>

  );
}