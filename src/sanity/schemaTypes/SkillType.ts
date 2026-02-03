import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'

export const SkillType = defineType({
  name: 'skill',
  title: 'Skill',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'e.g., Languages, Frameworks, Tools, etc.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{type: 'string'}],
      description: 'List of skills in this category',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which this category should appear',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'category',
      skills: 'skills',
    },
    prepare({title, skills}) {
      return {
        title,
        subtitle: skills ? `${skills.length} skills` : 'No skills',
      }
    },
  },
})
