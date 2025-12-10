import { defineType } from 'sanity'
import { ACTIVE_LOCALES } from './i18n'

export const glossaryTerm = defineType({
  name: 'glossaryTerm',
  title: 'Glossary Term',
  type: 'document',
  fields: [
    { name: 'source', type: 'string', title: 'Source Term', validation: (Rule) => Rule.required() },
    {
      name: 'targets',
      type: 'array',
      title: 'Localized Targets',
      of: [
        {
          type: 'object',
          name: 'target',
          fields: [
            {
              name: 'locale',
              type: 'string',
              title: 'Locale',
              options: { list: ACTIVE_LOCALES.map((l) => ({ title: l.toUpperCase(), value: l })) },
              validation: (Rule) => Rule.required(),
            },
            { name: 'value', type: 'string', title: 'Value', validation: (Rule) => Rule.required() },
          ],
          preview: { select: { title: 'value', subtitle: 'locale' } },
        },
      ],
    },
    { name: 'doNotTranslate', type: 'boolean', title: 'Do Not Translate' },
    { name: 'notes', type: 'text', title: 'Notes' },
  ],
  preview: {
    select: { title: 'source', dnt: 'doNotTranslate' },
    prepare({ title, dnt }) {
      return { title, subtitle: dnt ? 'DNT' : undefined }
    },
  },
})
