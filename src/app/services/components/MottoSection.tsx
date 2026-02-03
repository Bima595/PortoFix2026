'use client';

import { motion, useScroll, useTransform, useMotionValue, animate, MotionValue } from 'motion/react';
import { useRef, useEffect } from 'react';

interface Stat {
  _id: string;
  label: string;
  value: number;
  suffix?: string;
  order: number;
}

interface MottoSectionProps {
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

function Word({ 
  word, 
  progress, 
  range, 
  isHighlighted 
}: { 
  word: string; 
  progress: MotionValue<number>; 
  range: [number, number];
  isHighlighted: boolean;
}) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [5, 0]);

  return (
    <span className="relative inline-block mr-[0.3em] mb-[0.1em]">
      {/* Gray Base Layer */}
      <span className="text-zinc-800">{word}</span>
      
      {/* Reveal Layer */}
      <motion.span
        style={{ opacity, y }}
        className={`absolute inset-0 ${isHighlighted ? 'text-white' : 'text-zinc-400'}`}
      >
        {word}
      </motion.span>
    </span>
  );
}

export function MottoSection({ stats }: MottoSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.2"]
  });

  const text = "BUILDING HIGH-PERFORMANCE BRANDS AND PROVIDING DIGITAL SUPPORT THAT DELIVER MEASURABLE RESULTS.";
  const words = text.split(" ");

  return (
    <section ref={sectionRef} className="w-full pt-32 pb-8 px-8">
      <div className="max-w-4xl mx-auto flex flex-col items-start text-left">
        {/* Large Typography with Scroll Reveal */}
        <h2 className="text-4xl md:text-5xl lg:text-5.5xl font-bold leading-[1.1] tracking-tight text-zinc-800 mb-12 uppercase flex flex-wrap">
          {words.map((word, i) => {
            const isHighlighted = word === "BRANDS" || word === "DIGITAL" || word === "SUPPORT" || word === "RESULTS.";
            const start = i / words.length;
            const end = (i + 1) / words.length;
            
            return (
              <Word 
                key={i} 
                word={word} 
                progress={scrollYProgress} 
                range={[0.1 + start * 0.7, 0.1 + end * 0.7]}
                isHighlighted={isHighlighted}
              />
            );
          })}
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 w-full">
          {stats.sort((a,b) => a.order - b.order).map((stat) => (
            <motion.div
              key={stat._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }} // Repeatable animation
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-start gap-1"
            >
              <div className="text-6xl md:text-7xl font-bold tracking-tighter text-zinc-100 leading-none">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
