'use client';

import { motion, Variants } from 'motion/react';
import { Timer, Palette, Layers, CreditCard } from 'lucide-react';

const benefits = [
  {
    icon: Timer,
    title: 'Fast turnaround',
    description: 'We focus on one client at a time, delivering exceptional results fast, without compromising on quality.',
  },
  {
    icon: Palette,
    title: 'Tailored design',
    description: 'We emphasise delivering unique designs, ensuring your brand stands out with a distinct visual identity.',
  },
  {
    icon: Layers,
    title: 'Scalable solutions',
    description: 'We can integrate new features, revamp content and adapt your project to follow the latest trends.',
  },
  {
    icon: CreditCard,
    title: 'Fixed price',
    description: 'Access a range of web services at a fixed price, making it easier to budget and control expenses.',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  },
};

export function BenefitsSection() {
  return (
    <section className="w-full py-24 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="flex items-start gap-2 mb-20">
          <h2 className="text-5xl md:text-6xl font-medium text-zinc-100 tracking-tight">
            Benefits
          </h2>
        </div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                className="flex flex-col items-start text-left group"
              >
                <div className="mb-6 p-1 text-zinc-400 group-hover:text-zinc-100 transition-colors duration-300">
                  <Icon className="w-6 h-6 stroke-[1.5px]" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-4 tracking-tight">
                  {benefit.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed text-[15px] font-light">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
