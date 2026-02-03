'use client';

import { motion, Variants } from 'motion/react';
import { Target, Users2, Zap, Code, Rocket } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

const approachSteps = [
  {
    icon: Target,
    title: 'Consulting',
    description: "We dive deep into your goals to build a scalable system architecture. Understanding your SEO needs and performance targets is our foundation.",
    size: 'small',
  },
  {
    icon: Users2,
    title: 'Collaborative review',
    description: 'During the design phase, we invite you to review and provide feedback. This collaboration helps us establish the system structure and functionality significantly faster.',
    size: 'small',
  },
  {
    icon: Zap,
    title: 'High Performance',
    description: 'Creating a lightweight system without bloat. We prioritize clean code and speed to ensure instant load times and a smooth user experience.',
    size: 'small',
  },
  {
    icon: Code,
    title: 'Iterate',
    description: "Polishing the system structure is crucial. We tirelessly test and refine the code to ensure it's secure, stable, and ready for scale.",
    size: 'large-left',
  },
  {
    icon: Rocket,
    title: 'Launch & Support',
    description: 'Handing off a fully optimized system is just the start. We offer ongoing Digital Support & Virtual Assistance to keep your business growing.',
    size: 'large-right',
    featured: true,
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
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

export function ProcessSection() {
  return (
    <section className="w-full py-16 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="flex items-start gap-2 mb-8">
          <h2 className="text-4xl md:text-5xl font-medium text-zinc-100 tracking-tight">
            Approach
          </h2>
        </div>

        {/* Main Background Card Container */}
        <div className="p-4 md:p-6 rounded-[2.5rem] bg-zinc-100/5 border border-white/5">
          {/* Bento Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-6 gap-3"
          >
            {approachSteps.map((step) => {
              const Icon = step.icon;
              const isFeatured = step.featured;
              const isAlternate = step.size === 'large-left';
              
              // Grid spanning logic
              let gridStyles = "md:col-span-2"; // default for small
              if (step.size === 'large-left') gridStyles = "md:col-span-2";
              if (step.size === 'large-right') gridStyles = "md:col-span-4";

              return (
                <motion.div
                  key={step.title}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`
                    rounded-[1.8rem] relative overflow-hidden transition-colors duration-500 group
                    ${gridStyles}
                  `}
                >
                  <SpotlightCard 
                    className={`
                      p-6 md:p-8 h-full flex flex-col items-start text-left transition-all duration-500
                      ${isFeatured 
                        ? 'bg-zinc-900 text-white border border-zinc-800' 
                        : isAlternate
                          ? 'bg-zinc-200 text-zinc-900 border border-zinc-300/50 shadow-sm'
                          : 'bg-zinc-100 text-zinc-900 border border-zinc-200/50 shadow-sm'
                      }
                    `}
                    spotlightColor={isFeatured ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.35)"}
                  >
                    {/* Icon */}
                    <div className={`mb-5 transition-all duration-500 group-hover:scale-110 ${isFeatured ? 'text-zinc-400 group-hover:text-white' : 'text-zinc-500 group-hover:text-zinc-900'}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <h3 className={`text-lg font-bold mb-3 tracking-tight transition-colors duration-500 ${isFeatured ? 'text-zinc-100' : 'text-zinc-900'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-[13px] leading-relaxed font-medium transition-colors duration-500 ${isFeatured ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {step.description}
                    </p>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
