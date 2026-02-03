import {UserIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const bioType = defineType({
  name: 'bio',
  title: 'Bio',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'position',
      title: 'Position',
      type: 'string',
      description: 'Your current job title or role (e.g., Software Engineer)',
    }),
    defineField({
      name: 'place',
      title: 'Place',
      type: 'string',
      description: 'Where you are based (e.g., New York, NY)',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A short biography or introduction',
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image' as const,
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        })
      ]
    }),
    defineField({
      name: 'currentCompany',
      title: 'Current Company',
      type: 'string',
      description: 'Your current company or organization',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Contact email address',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              description: 'e.g., Github, Twitter, LinkedIn',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'username',
              title: 'Username/Handle',
              type: 'string',
              description: 'e.g., @username or username.eth',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'Full URL to your profile',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'platform',
              subtitle: 'username',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'resume',
      title: 'Resume',
      type: 'file',
      description: 'Upload your CV/Resume (PDF preferred)',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'position',
      media: 'avatar',
    },
  },
})
