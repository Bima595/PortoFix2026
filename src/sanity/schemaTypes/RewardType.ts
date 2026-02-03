import {defineField, defineType} from 'sanity'

export const RewardType = defineType({
  name: 'Reward',
  description: 'description',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Description of the reward you received',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'Date of the reward you received',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      date: 'date',
      description: 'description',
    },
  },
})
