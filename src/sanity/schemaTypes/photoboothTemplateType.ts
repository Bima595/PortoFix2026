import { ImageIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const photoboothTemplateType = defineType({
  name: 'photoboothTemplate',
  title: 'Photobooth Template',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Template Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'frameImage',
      title: 'Frame Overlay Image',
      type: 'image',
      description: 'PNG image with transparency where the photo will show through.',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'maxPhotos',
      title: 'Max Photos',
      type: 'number',
      description: 'Number of captures required for this template (e.g. 4 for a classic photo strip).',
      initialValue: 4,
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'layout',
      title: 'Layout Style',
      type: 'string',
      description: 'How the photos are arranged inside the frame.',
      options: {
        list: [
          { title: 'Classic Strip (Vertical)', value: 'strip' },
          { title: '2x2 Grid', value: 'grid' },
          { title: 'Single Photo', value: 'single' },
        ],
      },
      initialValue: 'strip',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle to show/hide this template in the photobooth.',
      initialValue: true,
    }),
    defineField({
      name: 'topPadding',
      title: 'Top Padding (%)',
      type: 'number',
      description: 'Percentage padding from the top edge of the frame to the photo slots (e.g. 12 for 12%).',
      initialValue: 3,
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: 'bottomPadding',
      title: 'Bottom Padding (%)',
      type: 'number',
      description: 'Percentage padding from the bottom edge of the frame to the photo slots (e.g. 10 for 10%).',
      initialValue: 10,
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: 'sidePadding',
      title: 'Side Padding (%)',
      type: 'number',
      description: 'Percentage padding from the left/right edges of the frame to the photo slots (e.g. 4 for 4%).',
      initialValue: 4,
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: 'rowSpacing',
      title: 'Row Spacing (%)',
      type: 'number',
      description: 'Percentage spacing between photos vertically (e.g. 2 for 2%).',
      initialValue: 2,
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: 'colSpacing',
      title: 'Column Spacing (%)',
      type: 'number',
      description: 'Percentage spacing between columns, if double strip (e.g. 4 for 4%).',
      initialValue: 4,
      validation: (rule) => rule.min(0).max(100),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'frameImage',
      maxPhotos: 'maxPhotos',
      layout: 'layout',
    },
    prepare({ title, media, maxPhotos, layout }) {
      return {
        title: title,
        subtitle: `${layout.toUpperCase()} layout • ${maxPhotos} photos`,
        media: media,
      };
    },
  },
});
