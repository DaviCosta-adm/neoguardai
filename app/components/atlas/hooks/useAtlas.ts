"use client";

import { useState } from "react";

export interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
}


function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}


export default function useAtlas() {


  const [open, setOpen] = useState(false);


  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-atlas-message",
      role: "assistant",
      content:
        "Olá! Eu sou o Atlas. Como posso ajudar você hoje?",
    },
  ]);



  const [input, setInput] = useState("");

  const [typing, setTyping] = useState(false);



  function toggleChat() {

    setOpen((prev) => !prev);

  }




  function addMessage(
    role: Message["role"],
    content: string
  ) {

    setMessages((old) => [
      ...old,
      {
        id: generateId(),
        role,
        content,
      },
    ]);

  }





  async function sendMessage() {


    const question = input.trim();


    if (!question || typing) return;



    addMessage(
      "user",
      question
    );


    setInput("");

    setTyping(true);



    try {


      const response = await fetch(
        "/api/atlas",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: question,
          }),

        }
      );



      if (!response.ok) {

        throw new Error(
          "Falha ao conectar com o Atlas."
        );

      }




      const data = await response.json();



      addMessage(
        "assistant",
        data.reply ??
          "Não consegui gerar uma resposta no momento."
      );




    } catch (error) {


      console.error(
        "Erro no Atlas:",
        error
      );



      addMessage(
        "assistant",
        "Desculpe, ocorreu um erro ao processar sua solicitação."
      );



    } finally {


      setTyping(false);


    }


  }




  return {

    open,

    toggleChat,

    messages,

    input,

    setInput,

    typing,

    sendMessage,

  };


}