import { defineField, defineType } from 'sanity';

export const statsType = defineType({
  name: 'stats',
  title: 'Stats',
  type: 'document',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "Projects Finalized"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'number',
      description: 'The numeric value to count up to',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'suffix',
      title: 'Suffix',
      type: 'string',
      description: 'e.g. "+", "%", or leave empty',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which this stat appears (lower numbers first)',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'label',
      value: 'value',
      suffix: 'suffix',
    },
    prepare({ title, value, suffix }) {
      return {
        title: title,
        subtitle: `${value}${suffix || ''}`,
      };
    },
  },
});
