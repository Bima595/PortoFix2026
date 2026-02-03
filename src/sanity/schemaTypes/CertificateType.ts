import {StarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const CertificateType = defineType({
  name: 'certificate',
  title: 'Certificate',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Certificate Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'issuer',
      title: 'Issuer',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'e.g., Coursera, Udemy, AWS',
    }),
    defineField({
      name: 'issueDate',
      title: 'Issue Date',
      type: 'date',
      options: {dateFormat: 'YYYY-MM'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'credentialLink',
      title: 'Credential Link',
      type: 'url',
    }),
    defineField({
      name: 'image',
      title: 'Certificate Image',
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'issuer',
      media: 'image',
    },
  },
})
