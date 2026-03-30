import {defineType} from 'sanity'
import {i18nSharedFields, withI18nInitialValue} from './i18n'

export const mailingPage = defineType({
  name: 'mailingPage',
  title: 'Mailing Page',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    },
    {
      name: 'cards',
      title: 'Icon Cards (3 items)',
      type: 'array',
      of: [{type: 'iconCard'}],
      validation: (Rule) => Rule.min(3).max(3),
    },
  ],
})
