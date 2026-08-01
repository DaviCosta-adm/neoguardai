import type { Metadata } from "next";
import "./globals.css";
import AtlasWidget from "./components/atlas/AtlasWidget";

export const metadata: Metadata = {

  title: "NeoGuardAI | Prevenção de Evasão Escolar com IA",

  description:
    "NeoGuardAI utiliza inteligência artificial, análise preditiva e o Atlas para identificar estudantes em risco e ajudar escolas a prevenir a evasão escolar.",


  keywords: [
    "Inteligência Artificial",
    "Evasão Escolar",
    "Prevenção de Evasão",
    "Machine Learning",
    "NeoGuardAI",
    "Atlas AI",
  ],


  icons: {
    icon: "/favicon.png",
  },


  openGraph: {

    title:
      "NeoGuardAI | Prevenção de Evasão Escolar com IA",

    description:
      "Identifique alunos em risco de evasão com antecedência e aja antes do abandono escolar.",

    type:
      "website",

  },


};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (

    <html lang="pt-BR">

      <body>


          {children}

         <AtlasWidget />
      </body>

    </html>

  );

}