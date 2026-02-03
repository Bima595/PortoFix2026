import {BookIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const EducationType = defineType({
  name: 'education',
  title: 'Education',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'institution',
      title: 'Institution',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'e.g., University of Technology',
    }),
    defineField({
      name: 'degree',
      title: 'Degree',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'e.g., Bachelor of Science',
    }),
    defineField({
      name: 'fieldOfStudy',
      title: 'Field of Study',
      type: 'string',
      description: 'e.g., Computer Science',
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
      description: 'Leave empty if current',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description involved activities or achievements',
    }),
    defineField({
      name: 'gpa',
      title: 'GPA',
      type: 'string',
      description: 'e.g., 3.85/4.00 or 3.85',
    }),
    defineField({
      name: 'honors',
      title: 'Honors/Awards',
      type: 'string',
      description: 'e.g., Summa Cum Laude, Dean\'s List',
    }),
    defineField({
      name: 'achievements',
      title: 'Key Achievements',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Notable achievements during education',
    }),
  ],
  preview: {
    select: {
      title: 'institution',
      subtitle: 'degree',
    },
  },
})
