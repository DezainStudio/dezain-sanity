import { defineType } from 'sanity'
import { i18nSharedFields, withI18nInitialValue } from './i18n'

export const dictionary = defineType({
  name: 'dictionary',
  title: 'Dictionary',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    {
      name: 'entries',
      type: 'array',
      title: 'Entries',
      of: [
        {
          type: 'object',
          name: 'entry',
          fields: [
            {
              name: 'key',
              type: 'string',
              title: 'Key',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'value',
              type: 'string',
              title: 'Value',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'notes',
              type: 'string',
              title: 'Notes',
            },
          ],
          preview: { select: { title: 'key', subtitle: 'value' } },
        },
      ],
    },
  ],
})
