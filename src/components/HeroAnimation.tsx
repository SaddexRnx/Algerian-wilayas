import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHRASES = [
  { text: 'Wilayas', color: 'text-black dark:text-white' },
  { text: 'ZIP codes', color: 'text-black dark:text-white' },
  { text: 'Neighborhoods', color: 'text-black dark:text-white' },
  { text: 'Bus routes', color: 'text-black dark:text-white' },
  { text: 'Local places', color: 'text-black dark:text-white' },
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
    <span className="inline-block min-w-[120px] text-left align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`${current.color} font-black inline-block`}
        >
          {current.text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
