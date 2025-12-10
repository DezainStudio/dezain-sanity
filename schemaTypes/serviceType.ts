import { defineType } from 'sanity'

// Non-localized taxonomy for classifying services
export const serviceType = defineType({
  name: 'serviceType',
  title: 'Service Type',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'value',
      title: 'Value',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'value.current',
    },
  },
})
