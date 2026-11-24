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
      title: 'Frame Overlay Image (PNG Transparan)',
      type: 'image',
      description: 'Upload PNG dengan area lubang foto transparan. Posisi kotak foto akan dideteksi otomatis oleh sistem.',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'maxPhotos',
      title: 'Max Photos',
      type: 'number',
      description: 'Jumlah slot foto (otomatis menyesuaikan jika PNG memiliki lubang transparan).',
      initialValue: 4,
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'layout',
      title: 'Layout Style',
      type: 'string',
      description: 'Kategori tampilan layout (Strip, Grid, atau Single).',
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
      description: 'Aktifkan untuk menampilkan frame ini di halaman Photo Booth.',
      initialValue: true,
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
