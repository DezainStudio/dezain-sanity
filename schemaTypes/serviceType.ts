import {defineType} from 'sanity'
import {isUniqueSlugWithinType, slugifyLocale} from './i18n'

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
        slugify: (input: string) => slugifyLocale(input),
        isUnique: isUniqueSlugWithinType,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      description: 'Optional manual ordering (lower appears first)',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'value.current',
    },
  },
})
