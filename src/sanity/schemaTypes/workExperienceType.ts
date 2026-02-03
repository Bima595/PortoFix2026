import {CaseIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const workExperienceType = defineType({
  name: 'workExperience',
  title: 'Work Experience',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'e.g., Senior Frontend Engineer',
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'e.g., Google, Amazon',
    }),
    defineField({
      name: 'companyLink',
      title: 'Company Link',
      type: 'url',
    }),
    defineField({
      name: 'companyLogo',
      title: 'Company Logo',
      type: 'image',
      description: 'Company logo image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      options: {dateFormat: 'YYYY-MM'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      options: {dateFormat: 'YYYY-MM'},
      description: 'Leave empty if currently working here',
    }),
    defineField({
      name: 'isCurrent',
      title: 'Is Current Position?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of your responsibilities and achievements',
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array' as const,
      of: [defineArrayMember({type: 'string'})],
      description: 'Key achievements and responsibilities (shown in dropdown)',
      options: {
        layout: 'list',
      },
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
      title: 'role',
      subtitle: 'company',
    },
  },
})
