import {PresentationIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const SideProjectType = defineType({
  name: 'sideProject',
  title: 'Side Project',
  type: 'document',
  icon: PresentationIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Project Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of the project',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Main display image/cover of the project',
      options: {hotspot: true},
    }),
    defineField({
      name: 'images',
      title: 'Project Images',
      type: 'array' as const,
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            }),
          ],
        }),
      ],
      options: {
        layout: 'grid',
      },
    }),
    defineField({
      name: 'repoLink',
      title: 'Repository Link',
      type: 'url',
    }),
    defineField({
      name: 'demoLink',
      title: 'Demo Link',
      type: 'url',
    }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array' as const,
      of: [defineArrayMember({type: 'string'})],
      options: {
        layout: 'tags',
      },
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'images.0',
    },
  },
})
