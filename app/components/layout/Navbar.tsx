"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";


export default function Navbar() {

  const [scrolled, setScrolled] = useState(false);


  useEffect(() => {

    const handleScroll = () => {

      setScrolled(window.scrollY > 40);

    };


    window.addEventListener(
      "scroll",
      handleScroll
    );


    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };


  }, []);





  const links = [
    {
      name: "Início",
      link: "#inicio",
    },
    {
      name: "Atlas",
      link: "#atlas",
    },
    {
      name: "Tecnologia",
      link: "#tecnologia",
    },
    {
      name: "Contato",
      link: "#contato",
    },
  ];





  return (

    <motion.nav

      initial={{
        opacity:0,
        y:-20,
      }}

      animate={{
        opacity:1,
        y:0,
      }}

      transition={{
        duration:0.6,
      }}


      className={`
        fixed
        left-0
        top-0
        z-50
        w-full
        transition-all
        duration-300

        ${
          scrolled
            ? "border-b border-white/10 bg-[#050816]/70 backdrop-blur-xl shadow-lg"
            : "bg-transparent"
        }
      `}

    >



      <div
        className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          px-8
          py-5
        "
      >






        {/* Logo */}
        <motion.a

          href="#inicio"

          whileHover={{
            scale:1.05,
          }}

          className="
            cursor-pointer
            text-xl
            font-black
            tracking-tight
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


        </motion.a>








        {/* Links */}
        <div
          className="
            hidden
            items-center
            gap-8
            md:flex
          "
        >

          {links.map((item)=>(


            <motion.a

              key={item.name}

              href={item.link}

              whileHover={{
                y:-2,
              }}

              className="
                text-sm
                text-gray-300
                transition
                hover:text-cyan-400
              "

            >

              {item.name}

            </motion.a>


          ))}


        </div>








        {/* Botão */}
        <motion.a

          href="/login"

          whileHover={{
            scale:1.05,
          }}

          whileTap={{
            scale:0.97,
          }}

          className="
            rounded-full
            bg-white
            px-6
            py-3
            text-sm
            font-semibold
            text-black
          "

        >

          Acessar sistema

        </motion.a>




      </div>


    </motion.nav>

  );
}