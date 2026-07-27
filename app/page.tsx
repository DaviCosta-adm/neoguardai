"use client";

import NeuralBackground from "./components/effects/NeuralBackground";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Hero from "./components/sections/Hero";
import AtlasSection from "./components/sections/AtlasSection";
import Features from "./components/sections/Features";
import Dashboard from "./components/sections/Dashboard";
import TrustedBy from "./components/sections/TrustedBy";
import CTA from "./components/sections/CTA";
import Contact from "./components/sections/Contact";


export default function Home() {

  return (

    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#050816]
        text-white
      "
    >


      <NeuralBackground />



      <div
        className="
          relative
          z-10
        "
      >


        <Navbar />



        {/* Hero */}
        <section id="inicio">
          <Hero />
        </section>





        {/* Atlas */}
        <section id="atlas">
          <AtlasSection />
        </section>





        {/* Tecnologia */}
        <section id="tecnologia">
          <Features />
        </section>





        {/* Dashboard */}
        <Dashboard />





        {/* Confiança */}
        <TrustedBy />





        {/* Chamada final */}
        <CTA />





        {/* Contato */}
        <section id="contato">
          <Contact />
        </section>





        {/* Rodapé */}
        <Footer />


      </div>


    </main>

  );
}