"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

export default function LoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);

  }, []);


  return (
    <>
    

      {children}
    </>
  );
}