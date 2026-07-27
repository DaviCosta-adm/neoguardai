"use client";

import { motion } from "framer-motion";


export default function Contact() {


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



      <div
        className="
          grid
          gap-10
          lg:grid-cols-2
          lg:items-center
        "
      >






        {/* Texto */}
        <motion.div

          initial={{
            opacity:0,
            x:-40,
          }}

          whileInView={{
            opacity:1,
            x:0,
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

            Contato

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

            Vamos construir

            <br />

            o futuro juntos.

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

            Entre em contato para conhecer como o
            NeoGuardAI pode transformar ambientes
            através da inteligência artificial.

          </p>







          <div
            className="
              mt-8
              space-y-4
            "
          >


            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.03]
                px-5
                py-4
              "
            >

              <p className="text-sm text-gray-400">
                Sistema
              </p>

              <p className="mt-1 font-semibold">
                Atlas Online
              </p>

            </div>





            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.03]
                px-5
                py-4
              "
            >

              <p className="text-sm text-gray-400">
                Disponibilidade
              </p>

              <p className="mt-1 font-semibold">
                Atendimento inteligente
              </p>

            </div>



          </div>



        </motion.div>









        {/* Formulário */}
        <motion.form

          initial={{
            opacity:0,
            x:40,
          }}

          whileInView={{
            opacity:1,
            x:0,
          }}

          transition={{
            duration:0.7,
          }}

          viewport={{
            once:false,
            amount:0.25,
          }}

          className="
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
              space-y-5
            "
          >



            <input

              placeholder="Nome"

              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-black/20
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-cyan-400
              "

            />





            <input

              placeholder="Email"

              type="email"

              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-black/20
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-cyan-400
              "

            />





            <textarea

              placeholder="Mensagem"

              rows={5}

              className="
                w-full
                resize-none
                rounded-xl
                border
                border-white/10
                bg-black/20
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-cyan-400
              "

            />






            <button

              type="button"

              className="
                w-full
                rounded-full
                bg-white
                py-4
                text-sm
                font-semibold
                text-black
                transition
                hover:scale-[1.02]
              "

            >

              Enviar mensagem

            </button>



          </div>




        </motion.form>




      </div>



    </section>

  );

}