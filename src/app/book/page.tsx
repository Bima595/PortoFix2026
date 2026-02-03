'use client';

import { useEffect } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";
import { motion } from 'motion/react';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function BookPage() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "dark",
        styles: { branding: { brandColor: "#000000" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-(family-name:--font-plus-jakarta-sans)">
      {/* Navigation */}
      <nav className="p-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link 
            href="/services" 
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Services</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-100">Booking</span>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto pt-20 pb-12 px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-medium tracking-tight mb-4"
        >
          Book a <span className="text-zinc-500 italic font-serif text-5xl md:text-6xl">Session</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-400 text-lg font-medium"
        >
          Select a time that works best for you to discuss your project.
        </motion.p>
      </div>

      {/* Cal.com Embed */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-6xl mx-auto px-6 pb-24"
      >
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/50 shadow-2xl shadow-black/50">
          <Cal
            calLink="395-satria-abimanyu-putra-wijayatama-uboqp4/secret"
            style={{ width: "100%", height: "100%", minHeight: "700px" }}
            config={{ layout: 'month_view', theme: 'dark' }}
          />
        </div>
      </motion.div>
    </main>
  );
}
