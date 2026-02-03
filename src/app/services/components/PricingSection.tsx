'use client';

import { motion, Variants } from 'motion/react';
import { Star, Cloud, Sun, Terminal, Check, Layout } from 'lucide-react';

interface PricingPlan {
  _id: string;
  tag?: string;
  title: string;
  price: number;
  priceSuffix?: string;
  originalPrice?: number;
  priceLabel?: string;
  description: string;
  features: string[];
  ctaLabel?: string;
  addOnTitle?: string;
  addOnPrice?: number;
  addOnDescription?: string;
  addOnFeatures?: string[];
  addOnCtaLabel?: string;
  order: number;
}

interface PricingSectionProps {
  plans: PricingPlan[];
  userEmail: string;
}

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

const getIcon = (title: string) => {
  switch (title.toLowerCase()) {
    case 'landing page': return Star;
    case 'website': return Cloud;
    case 'mobile app': return Sun;
    default: return Layout;
  }
};



export function PricingSection({ plans, userEmail }: PricingSectionProps) {
  // Sorting plans by order
  const sortedPlans = [...plans].sort((a, b) => a.order - b.order);

  const handlePricingClick = (planTitle: string, variantLabel: string = '') => {
    const suffix = variantLabel ? ` (${variantLabel})` : '';
    const subject = encodeURIComponent(`Project Inquiry - ${planTitle}${suffix}`);
    const body = encodeURIComponent(`Hello,\n\nI'm interested in the ${planTitle} package${suffix}.\n\nPlan: ${planTitle}\n${variantLabel ? `Option: ${variantLabel}\n` : ''}\nLet's discuss further!`);
    window.open(`mailto:${userEmail}?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <section id="pricing" className="w-full py-24 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-16">
          <h2 className="text-5xl md:text-6xl font-medium text-zinc-100 tracking-tight mb-4">
            Pricing
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            {/* Header description should be dynamic if possible, but for now removing the specific hardcoded text if requested */}
            Choose the perfect plan for your project needs.
          </p>
        </div>

        {/* Pricing Grid Container with Background Card */}
        <div className="p-4 md:p-6 rounded-[3rem] bg-zinc-100/5 border border-white/5">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.05 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start"
          >
            {sortedPlans.map((plan) => {
              const Icon = getIcon(plan.title);
              const hasDiscount = plan.originalPrice && plan.originalPrice > plan.price;
              
              return (
                <motion.div
                  key={plan._id}
                  variants={itemVariants}
                  className="flex flex-col gap-4 h-full"
                >
                  {/* Main Plan Card */}
                  <div className="bg-zinc-900 rounded-[2.5rem] p-6 flex flex-col shadow-2xl shadow-black/40 border border-white/10 hover:border-white/20 transition-all duration-300 relative group">
                    {/* Card Top Branding */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                        <Icon className="w-5 h-5 text-zinc-100" />
                      </div>
                      {hasDiscount && (
                        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest">
                          Save ${Number(plan.originalPrice) - plan.price}
                        </div>
                      )}
                    </div>

                    {/* Title & Price */}
                    <div className="mb-6 flex flex-col gap-3">
                      <h3 className="text-2xl font-bold text-zinc-100 tracking-tight">
                        {plan.title}
                      </h3>
                      <div className="flex flex-col items-start gap-1">
                        {plan.priceLabel && (
                          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                            {plan.priceLabel}
                          </span>
                        )}
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          {hasDiscount && (
                            <span className="text-lg font-medium text-zinc-500 line-through decoration-zinc-500/50">
                              ${plan.originalPrice?.toLocaleString()}
                            </span>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-zinc-100 leading-none">
                              ${plan.price.toLocaleString()}
                            </span>
                            {plan.priceSuffix && (
                              <span className="text-lg font-medium text-zinc-500">
                                {plan.priceSuffix}
                              </span>
                            )}
                            {plan.priceLabel && !plan.priceSuffix && <span className="text-2xl font-bold text-zinc-100">+</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium border-b border-white/5 pb-6">
                      {plan.description}
                    </p>

                    {/* Features List */}
                    <div className="flex flex-col gap-3 mb-8">
                      {plan.features.map((feature, i) => {
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-zinc-100 shrink-0 mt-0.5" />
                            <span className="text-sm font-semibold text-zinc-300 tracking-tight leading-tight">
                              {feature}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Main CTA */}
                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: '#e4e4e7' }} // zinc-200
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePricingClick(plan.title)}
                      className="w-full py-3.5 px-6 rounded-2xl bg-white text-zinc-900 font-bold text-sm tracking-tight transition-all shadow-lg shadow-white/5 border border-transparent mt-auto"
                    >
                      {plan.ctaLabel}
                    </motion.button>
                  </div>

                {/* Custom Code Add-on Card */}
                {plan.addOnTitle && (
                  <div className="bg-zinc-900/50 rounded-[2rem] p-5 border-2 border-dashed border-white/10 group relative transition-all duration-300 hover:border-white/20">
                    <div className="flex justify-between items-center mb-3 relative z-10">
                      <div className="flex items-center gap-3">
                        <motion.button 
                          whileHover={{ scale: 1.05, backgroundColor: '#e4e4e7' }} // zinc-200
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePricingClick(plan.title, plan.addOnTitle)}
                          className="p-2 rounded-lg bg-white text-zinc-900 shadow-xl shadow-white/10 transition-all"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </motion.button>
                        <span className="font-bold text-zinc-100 text-sm tracking-tight">
                          {plan.addOnTitle}
                        </span>
                      </div>
                      <span className="font-bold text-zinc-100">
                        +${plan.addOnPrice?.toLocaleString() ?? '0'}
                      </span>
                    </div>
                    
                    <p className="relative z-10 mb-6 font-medium leading-relaxed text-zinc-400 text-[12px]">
                      {plan.addOnDescription}
                    </p>

                    {/* Add-on Features */}
                    {plan.addOnFeatures && plan.addOnFeatures.length > 0 && (
                      <div className="relative z-10 flex flex-col gap-2 mb-6 ml-1">
                        {plan.addOnFeatures.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-zinc-400" />
                             <span className="text-[11px] font-medium text-zinc-300 tracking-tight">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: '#e4e4e7' }} // zinc-200
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePricingClick(plan.title, plan.addOnTitle)}
                      className="relative z-10 w-full rounded-2xl bg-zinc-100 px-6 py-4 text-[13px] font-bold tracking-tight text-zinc-900 shadow-xl shadow-black/20 transition-all"
                    >
                      {plan.addOnCtaLabel}
                    </motion.button>

                    <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
        </div>
      </div>
    </section>
  );
}
