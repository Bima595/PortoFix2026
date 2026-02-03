'use client';

import { motion, Variants } from 'motion/react';
import { Mail, Calendar } from 'lucide-react';
import Link from 'next/link';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  },
};

export function ContactCTASection() {
  return (
    <section className="w-full py-32 px-8 bg-zinc-950">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
        className="max-w-4xl mx-auto text-center"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Available for new projects</span>
        </motion.div>

        <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl font-medium text-zinc-100 tracking-tight mb-8 leading-tight">
          Let&apos;s build something <br />
          <span className="text-zinc-500 italic font-serif">extraordinary</span> together.
        </motion.h2>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
          <Link href="/book" className="px-8 py-4 rounded-2xl bg-white text-zinc-900 font-bold text-lg hover:bg-zinc-100 transition-all duration-300 shadow-xl shadow-white/10 group">
            <span className="flex items-center gap-2">
              Book a Discovery Call
              <Calendar className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link href="mailto:satriaabimanyu595@gmail.com" className="px-8 py-4 rounded-2xl bg-zinc-900 text-zinc-100 border border-white/10 font-bold text-lg hover:bg-zinc-800 transition-all duration-300 group">
            <span className="flex items-center gap-2">
              Send an Email
              <Mail className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            </span>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-20 pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-zinc-500 font-medium">© 2024 Satriabmnyu. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-zinc-400 hover:text-white transition-colors font-medium">Twitter</a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors font-medium">LinkedIn</a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors font-medium">Instagram</a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
