import type { Metadata } from "next";
import "./globals.css";
import AtlasWidget from "./components/atlas/AtlasWidget";

export const metadata: Metadata = {

  title: "NeoGuardAI | Inteligência Artificial para Ambientes Seguros",

  description:
    "NeoGuardAI utiliza inteligência artificial, análise preditiva e o Atlas para transformar ambientes escolares em espaços mais seguros e inteligentes.",


  keywords: [
    "Inteligência Artificial",
    "Segurança Escolar",
    "Machine Learning",
    "NeoGuardAI",
    "Atlas AI",
  ],


  icons: {
    icon: "/favicon.png",
  },


  openGraph: {

    title:
      "NeoGuardAI | Inteligência Artificial para Ambientes Seguros",

    description:
      "Uma nova geração de segurança utilizando inteligência artificial.",

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