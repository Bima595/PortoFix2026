'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  },
};

const faqs = [
  {
    question: "How long does a typical project take?",
    answer: "For CMS and Custom Website projects, it typically takes around 1 month, depending on the complexity, scope, and feedback cycles. Mobile apps or highly complex systems may take longer."
  },
  {
    question: "What if I don't like the design?",
    answer: "We work iteratively. You'll review the design at an early stage, and we'll refine it until it perfectly aligns with your vision before moving to development."
  },
  {
    question: "I already have a design from Figma or etc, can you develop it?",
    answer: "Absolutely! We can take your Figma, Adobe XD, or any other design files and transform them into a high-performance, responsive website or application."
  },
  {
    question: "How does the payment structure work?",
    answer: "We work with a milestone-based structure: 25% upfront to start, 25% after design approval, and the remaining 50% upon final delivery."
  },
  {
    question: "How does it work?",
    answer: "Our process is streamlined for collaboration: Consulting to understand goals, Design Review for feedback, and iterative Development until the final launch."
  },
  {
    question: "Where do I get started?",
    answer: "Simply book a discovery call or send us an email. We'll discuss your project goals, timeline, and how we can best help you achieve them."
  },
  {
    question: "Do you offer refunds?",
    answer: "Due to the allocated time and resources for each project, we generally don't offer refunds once work has begun. However, our iterative process ensures you are involved and satisfied at every stage."
  },
  {
    question: "Do you provide Digital Support & Virtual Assistance?",
    answer: "Yes, we do! Beyond development, we offer ongoing Digital Support and Virtual Assistance services. Whether you need website maintenance, content updates, or administrative support, we're here to help your business run smoothly."
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div variants={itemVariants} className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-6 text-left group"
      >
        <span className="text-lg md:text-xl font-medium text-zinc-300 group-hover:text-white transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors"
        >
          <ChevronDown className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-base text-zinc-400 leading-relaxed max-w-3xl font-medium">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section className="w-full py-24 px-8 bg-zinc-950">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-start mb-16">
          <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 mb-6">
            <HelpCircle className="w-6 h-6 text-zinc-400" />
          </div>
          <h2 className="text-5xl md:text-6xl font-medium text-zinc-100 tracking-tight mb-4">
            Commonly Asked <br />
            <span className="text-zinc-500 italic font-serif">Questions</span>
          </h2>
          <p className="text-zinc-400 text-lg font-medium max-w-xl">
            Everything you need to know about working together and our process.
          </p>
        </motion.div>

        <div className="flex flex-col">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
