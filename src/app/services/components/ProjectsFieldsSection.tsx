'use client';

import { motion, Variants } from 'motion/react';

interface Project {
  _id: string;
  title: string;
  icon: string;
  order: number;
}

interface Field {
  _id: string;
  title: string;
  icon: string;
  order: number;
}

interface ProjectsFieldsSectionProps {
  projects: Project[];
  fields: Field[];
}

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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  },
};

export function ProjectsFieldsSection({ projects, fields }: ProjectsFieldsSectionProps) {
  // Sort data by order
  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <section className="w-full pt-8 pb-32 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Projects List - Left Side */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-10%" }}
            className="flex flex-col gap-4"
          >
            {sortedProjects.map((project) => (
              <motion.div
                key={project._id}
                variants={itemVariants}
                className="group cursor-default"
              >
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-700 group-hover:text-zinc-100 transition-colors duration-500 tracking-tight">
                  {project.title}
                </h3>
              </motion.div>
            ))}
          </motion.div>

          {/* Fields Card - Right Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative p-10 md:p-12 rounded-[2.5rem] bg-zinc-900 text-white overflow-hidden shadow-2xl shadow-zinc-950/20 border border-zinc-800/50"
          >
            {/* Header with Star Icon */}
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                Fields
              </h2>
              <div className="text-4xl font-bold animate-pulse">
                *
              </div>
            </div>

            {/* Fields List */}
            <div className="flex flex-col gap-2">
              {sortedFields.map((field) => (
                <div 
                  key={field._id}
                  className="text-lg md:text-xl font-medium opacity-90 hover:opacity-100 transition-opacity"
                >
                  {field.title}
                </div>
              ))}
            </div>

            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
