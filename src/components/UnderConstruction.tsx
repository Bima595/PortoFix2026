'use client';

import Link from 'next/link';
import { Construction, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface UnderConstructionProps {
  title: string;
  description?: string;
}

export function UnderConstruction({ title, description = "This page is currently under construction. Please check back later!" }: UnderConstructionProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center items-center text-zinc-100 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center gap-6 max-w-md"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="p-5 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm shadow-2xl relative group"
        >
          <div className="absolute inset-0 rounded-full bg-zinc-800/20 animate-pulse group-hover:bg-zinc-700/30 transition-colors" />
          <Construction className="w-12 h-12 text-zinc-300 relative z-10" />
        </motion.div>
        
        <div className="flex flex-col gap-3">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent"
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-zinc-400 text-base leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link 
            href="/"
            className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 text-zinc-950 hover:bg-white hover:scale-105 transition-all duration-300 font-medium text-sm shadow-lg shadow-zinc-900/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
