import { defineType } from 'sanity'
import { i18nSharedFields, withI18nInitialValue } from './i18n'

export const redirect = defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    {
      name: 'from',
      type: 'string',
      title: 'From Path',
      description: 'Path to redirect from, e.g. /old-page',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'to',
      type: 'string',
      title: 'To Path or URL',
      description: 'Destination path or absolute URL',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'permanent',
      type: 'boolean',
      title: 'Permanent (308/301)',
      initialValue: true,
    },
    {
      name: 'enabled',
      type: 'boolean',
      title: 'Enabled',
      initialValue: true,
    },
  ],
  preview: {
    select: { title: 'from', subtitle: 'to' },
  },
})
