import { defineField, defineType, defineArrayMember } from 'sanity';

export const pricingType = defineType({
  name: 'pricing',
  title: 'Pricing Plan',
  type: 'document',
  fields: [
    defineField({
      name: 'tag',
      title: 'Tag',
      type: 'string',
      description: 'e.g. "Most Popular", "Best Value" (optional)',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. "Landing Page", "Website", "Mobile App"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Discount Price',
      type: 'number',
      description: 'Current/Sale price in USD',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'priceSuffix',
      title: 'Price Suffix',
      type: 'string',
      description: 'e.g. "/month", "/year", "one-time" (optional)',
    }),
    defineField({
      name: 'originalPrice',
      title: 'Original Price',
      type: 'number',
      description: 'Original price before discount (optional). If filled, it will show as strikethrough.',
    }),
    defineField({
      name: 'priceLabel',
      title: 'Price Label',
      type: 'string',
      description: 'e.g. "Starting at", "From"',
      initialValue: 'Starting at',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Short benefit-driven description',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array' as const,
      of: [defineArrayMember({type: 'string'})],
      description: 'List of included features',
      validation: (Rule) => Rule.required().min(3),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Button Label',
      type: 'string',
      description: 'e.g. "Get Started", "Book Now"',
      initialValue: 'Get Started',
    }),
    defineField({
      name: 'addOnTitle',
      title: 'Add-on Title',
      type: 'string',
      description: 'Optional add-on service title (e.g. "Custom Development")',
    }),
    defineField({
      name: 'addOnPrice',
      title: 'Add-on Price',
      type: 'number',
      description: 'Additional price for add-on service',
    }),
    defineField({
      name: 'addOnDescription',
      title: 'Add-on Description',
      type: 'text',
      description: 'Specific description for the add-on (e.g. "We build your site in Framer...")',
    }),
    defineField({
      name: 'addOnFeatures',
      title: 'Add-on Features',
      type: 'array' as const,
      of: [defineArrayMember({type: 'string'})],
      description: 'List of features included in the add-on',
    }),
    defineField({
      name: 'addOnCtaLabel',
      title: 'Add-on Button Label',
      type: 'string',
      description: 'e.g. "Get Design + Development", "Upgrade Now"',
      initialValue: 'Get Design + Development',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which this plan appears',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      price: 'price',
      tag: 'tag',
    },
    prepare({ title, price, tag }) {
      return {
        title: title,
        subtitle: `$${price}${tag ? ` • ${tag}` : ''}`,
      };
    },
  },
});
