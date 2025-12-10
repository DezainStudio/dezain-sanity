import { defineType } from 'sanity'
import { i18nSharedFields, withI18nInitialValue } from './i18n'

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    {
      name: 'url',
      title: 'Video URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
  preview: {
    select: {
      title: 'title',
      url: 'url',
    },
    prepare({ title, url }) {
      return {
        title: title || 'Video',
        subtitle: url,
      }
    },
  },
})
