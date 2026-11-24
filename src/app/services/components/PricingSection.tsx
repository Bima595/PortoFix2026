'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

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

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];
const INITIAL_FEATURE_LIMIT = 8;

export function PricingSection({ plans, userEmail }: PricingSectionProps) {
  const sortedPlans = [...(plans ?? [])].sort((a, b) => a.order - b.order);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeOptionByPlan, setActiveOptionByPlan] = useState<
    Record<string, 'main' | 'addon'>
  >({});
  const [expandedFeaturesByPlan, setExpandedFeaturesByPlan] = useState<
    Record<string, boolean>
  >({});
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const count = sortedPlans.length;
  const safeIndex = count > 0 ? Math.min(selectedIndex, count - 1) : 0;
  const activePlan = sortedPlans[safeIndex];

  const handlePricingClick = (planTitle: string, variantLabel: string = '') => {
    const suffix = variantLabel ? ` (${variantLabel})` : '';
    const subject = encodeURIComponent(`Project Inquiry - ${planTitle}${suffix}`);
    const body = encodeURIComponent(
      `Hello,\n\nI am interested in the ${planTitle} package${suffix}.\n\nPlan: ${planTitle}${
        variantLabel ? `\nOption: ${variantLabel}` : ''
      }\n\nLooking forward to discussing the scope and timeline.`
    );
    window.location.href = `mailto:${userEmail}?subject=${subject}&body=${body}`;
  };

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (count <= 1) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (idx + 1) % count;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (idx - 1 + count) % count;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = count - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      setSelectedIndex(nextIndex);
      tabRefs.current[nextIndex]?.focus();
      tabRefs.current[nextIndex]?.scrollIntoView({
        block: 'nearest',
        inline: 'center',
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="pricing" className="w-full px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col gap-2 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
              Pricing
            </h2>
            <p className="text-base text-zinc-400">
              Select a package below to inspect deliverables and starting rates.
            </p>
          </div>

          {count > 1 && (
            <p className="text-xs font-medium tabular-nums text-[#94949E] sm:text-sm">
              {count} packages available
            </p>
          )}
        </motion.div>

        {!activePlan ? (
          <div className="rounded-3xl border border-white/10 bg-[#111113] p-8 text-sm text-[#94949E]">
            Pricing packages are currently unavailable. Reach out via email for a custom quote.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="space-y-5"
          >
            {/* Compact Package Selector Bar (shows all package names & prices at once) */}
            {count > 1 && (
              <div
                role="tablist"
                aria-label="Pricing packages"
                className="scrollbar-mono -mx-6 flex gap-2.5 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:flex md:flex-wrap"
              >
                {sortedPlans.map((plan, idx) => {
                  const isSelected = idx === safeIndex;
                  return (
                    <button
                      key={plan._id}
                      ref={(el) => {
                        tabRefs.current[idx] = el;
                      }}
                      id={`pricing-tab-${plan._id}`}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls={`pricing-panel-${plan._id}`}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => setSelectedIndex(idx)}
                      onKeyDown={(e) => handleTabKeyDown(e, idx)}
                      className={`flex min-h-[54px] shrink-0 items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:flex-1 ${
                        isSelected
                          ? 'border-white bg-white text-zinc-950'
                          : 'border-white/12 bg-[#111113] text-zinc-200 hover:border-white/30 hover:bg-[#17171B] hover:text-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-semibold sm:text-[15px]">
                          {plan.title}
                        </span>
                        {plan.tag && (
                          <span
                            className={`mt-0.5 block truncate text-xs ${
                              isSelected ? 'text-[#52525B]' : 'text-[#94949E]'
                            }`}
                          >
                            {plan.tag}
                          </span>
                        )}
                      </div>

                      <span
                        className={`shrink-0 text-sm font-bold tabular-nums ${
                          isSelected ? 'text-zinc-950' : 'text-white'
                        }`}
                      >
                        ${plan.price.toLocaleString()}
                        {plan.priceSuffix ? (
                          <span
                            className={`font-normal ${
                              isSelected ? 'text-[#52525B]' : 'text-[#94949E]'
                            }`}
                          >
                            {plan.priceSuffix}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Focused Compact Split Card */}
            <AnimatePresence mode="wait">
              <PlanDetailPanel
                key={activePlan._id}
                plan={activePlan}
                activeOption={activeOptionByPlan[activePlan._id] ?? 'main'}
                onChangeOption={(opt) =>
                  setActiveOptionByPlan((prev) => ({
                    ...prev,
                    [activePlan._id]: opt,
                  }))
                }
                isFeaturesExpanded={Boolean(expandedFeaturesByPlan[activePlan._id])}
                onToggleFeatures={() =>
                  setExpandedFeaturesByPlan((prev) => ({
                    ...prev,
                    [activePlan._id]: !prev[activePlan._id],
                  }))
                }
                onSelectCta={handlePricingClick}
              />
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

interface PlanDetailPanelProps {
  plan: PricingPlan;
  activeOption: 'main' | 'addon';
  onChangeOption: (option: 'main' | 'addon') => void;
  isFeaturesExpanded: boolean;
  onToggleFeatures: () => void;
  onSelectCta: (planTitle: string, variantLabel?: string) => void;
}

function PlanDetailPanel({
  plan,
  activeOption,
  onChangeOption,
  isFeaturesExpanded,
  onToggleFeatures,
  onSelectCta,
}: PlanDetailPanelProps) {
  const showAddon = activeOption === 'addon' && Boolean(plan.addOnTitle);
  const hasDiscount =
    !showAddon &&
    Boolean(plan.originalPrice && plan.originalPrice > plan.price);
  const savings = hasDiscount ? Number(plan.originalPrice) - plan.price : 0;

  const rawFeatures = showAddon
    ? plan.addOnFeatures ?? []
    : plan.features ?? [];
  const hasMoreFeatures = rawFeatures.length > INITIAL_FEATURE_LIMIT;
  const visibleFeatures =
    isFeaturesExpanded || !hasMoreFeatures
      ? rawFeatures
      : rawFeatures.slice(0, INITIAL_FEATURE_LIMIT);

  const ctaText = showAddon
    ? plan.addOnCtaLabel || `Request ${plan.addOnTitle}`
    : plan.ctaLabel || `Request ${plan.title}`;

  return (
    <motion.div
      id={`pricing-panel-${plan._id}`}
      role="tabpanel"
      aria-labelledby={`pricing-tab-${plan._id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="grid grid-cols-1 overflow-hidden rounded-3xl border border-white/12 bg-[#111113] lg:grid-cols-12"
    >
      {/* Left Pane: Price, Option Toggle, Summary & CTA */}
      <div className="flex flex-col justify-between gap-6 border-b border-white/10 p-6 sm:p-8 lg:col-span-5 lg:border-r lg:border-b-0">
        <div className="space-y-5">
          {/* Base vs Add-on Switcher */}
          {plan.addOnTitle && (
            <div className="inline-flex rounded-full border border-white/12 bg-[#09090B] p-1">
              <button
                type="button"
                onClick={() => onChangeOption('main')}
                aria-pressed={!showAddon}
                className={`min-h-[44px] rounded-full px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  !showAddon
                    ? 'bg-white text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Base plan
              </button>
              <button
                type="button"
                onClick={() => onChangeOption('addon')}
                aria-pressed={showAddon}
                className={`min-h-[44px] rounded-full px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  showAddon
                    ? 'bg-white text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                + {plan.addOnTitle}
              </button>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">
              {showAddon ? plan.addOnTitle : plan.title}
            </h3>

            {!showAddon && plan.priceLabel && (
              <p className="text-xs font-medium text-[#94949E]">{plan.priceLabel}</p>
            )}

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1">
              {hasDiscount && (
                <span className="text-base font-medium tabular-nums text-[#94949E] line-through">
                  ${plan.originalPrice?.toLocaleString()}
                </span>
              )}

              <span className="text-4xl font-bold leading-none tracking-[-0.03em] tabular-nums text-white sm:text-[42px]">
                {showAddon
                  ? `+$${(plan.addOnPrice ?? 0).toLocaleString()}`
                  : `$${plan.price.toLocaleString()}`}
              </span>

              {!showAddon && plan.priceSuffix && (
                <span className="text-base font-medium text-[#94949E]">
                  {plan.priceSuffix}
                </span>
              )}

              {!showAddon && plan.priceLabel && !plan.priceSuffix && (
                <span className="text-2xl font-bold text-white">+</span>
              )}

              {hasDiscount && savings > 0 && (
                <span className="rounded-full border border-white/20 bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-zinc-100">
                  Save ${savings.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
            {showAddon ? plan.addOnDescription : plan.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            showAddon
              ? onSelectCta(plan.title, plan.addOnTitle)
              : onSelectCta(plan.title)
          }
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98]"
        >
          {ctaText}
        </button>
      </div>

      {/* Right Pane: Compact 2-Column Deliverables Grid */}
      <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:col-span-7">
        <div className="space-y-5">
          <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3.5">
            <h4 className="text-sm font-semibold text-white">Included deliverables</h4>
            <span className="text-xs tabular-nums text-[#94949E]">
              {rawFeatures.length} {rawFeatures.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {visibleFeatures.length === 0 ? (
            <p className="text-sm text-[#94949E]">
              Contact us for a tailored list of deliverables for this package.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
              {visibleFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm leading-snug text-zinc-200">
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0 text-white"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasMoreFeatures && (
          <div>
            <button
              type="button"
              onClick={onToggleFeatures}
              aria-expanded={isFeaturesExpanded}
              className="-ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span>
                {isFeaturesExpanded
                  ? 'Show fewer deliverables'
                  : `Show all ${rawFeatures.length} deliverables`}
              </span>
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${
                  isFeaturesExpanded ? 'rotate-180' : ''
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
