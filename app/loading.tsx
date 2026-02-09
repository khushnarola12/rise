'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[9999]">
      <div className="relative">
        {/* Outline Text (Background) */}
        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-transparent opacity-20 select-none"
            style={{ WebkitTextStroke: "2px #ffffff" }}>
          RISE.FIT
        </h1>

        {/* Filled Text (Foreground - Animating) */}
        <motion.div
  initial={{ height: "0%" }}
  animate={{ height: "100%" }}
  transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5 }}
  className="absolute bottom-0 left-0 w-full overflow-hidden"
>
  <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-primary select-none whitespace-nowrap">
    RISE.FIT
  </h1>
</motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 flex items-center gap-2"
      >
          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </motion.div>
    </div>
  );
}
