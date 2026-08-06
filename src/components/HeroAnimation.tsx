import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHRASES = [
  { text: 'Wilayas', color: 'text-blue-600' },
  { text: 'ZIP codes', color: 'text-emerald-500' },
  { text: 'Neighborhoods', color: 'text-sky-500' },
  { text: 'Bus routes', color: 'text-teal-500' },
  { text: 'Local places', color: 'text-indigo-500' },
];

export function HeroAnimation() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % PHRASES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const current = PHRASES[index];
  if (!current) return null;

  return (
    <span className="inline-block min-w-[180px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`${current.color} font-black inline-block`}
        >
          {current.text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
