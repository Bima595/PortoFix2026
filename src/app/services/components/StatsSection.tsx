'use client';

import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect, useRef } from 'react';

interface Stat {
  _id: string;
  label: string;
  value: number;
  suffix?: string;
  order: number;
}

interface StatsSectionProps {
  stats: Stat[];
}

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: 'easeOut',
    });

    return controls.stop;
  }, [count, value]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${latest}${suffix}`;
      }
    });

    return () => unsubscribe();
  }, [rounded, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="w-full py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-8 rounded-2xl bg-linear-to-br from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-300"
            >
              <div className="text-5xl md:text-6xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-lg text-zinc-300 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
