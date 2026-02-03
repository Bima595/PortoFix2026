import { defineField, defineType } from 'sanity';

export const fieldType = defineType({
  name: 'field',
  title: 'Field',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. "E-Commerce", "AI/ML", "Fintech"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'Lucide icon name (e.g. "ShoppingCart", "Brain", "DollarSign")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which this field appears',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      icon: 'icon',
    },
    prepare({ title, icon }) {
      return {
        title: title,
        subtitle: `Icon: ${icon}`,
      };
    },
  },
});
