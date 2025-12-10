import { defineType } from 'sanity'
import { i18nSharedFields, withI18nInitialValue } from './i18n'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    {
      name: 'siteTitle',
      type: 'string',
      title: 'Site Title',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'domain',
      type: 'url',
      title: 'Primary Domain',
    },
    {
      name: 'navigation',
      type: 'array',
      title: 'Navigation Links',
      of: [
        {
          type: 'object',
          name: 'navItem',
          fields: [
            { name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required() },
            { name: 'url', type: 'string', title: 'URL / Slug', description: 'Internal slug or full URL' },
          ],
          preview: {
            select: { title: 'label', subtitle: 'url' },
          },
        },
      ],
    },
    {
      name: 'footerText',
      type: 'string',
      title: 'Footer Text',
    },
  ],
})
