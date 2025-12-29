import {defineType} from 'sanity'
import {
  i18nSharedFields,
  slugifyLocale,
  isUniqueSlugWithinLocale,
  withI18nInitialValue,
} from './i18n'

export const trustedBy = defineType({
  name: 'trustedBy',
  title: 'Trusted By',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    {
      name: 'name',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        slugify: (input: string, _schemaType: any, context: any) =>
          slugifyLocale(input, context?.document?.locale),
        isUnique: isUniqueSlugWithinLocale,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'ALT'}],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'portfolioWork',
      title: 'Portfolio Work',
      type: 'reference',
      to: [{type: 'portfolio'}],
      options: {
        filter: ({document}: any) => {
          const locale = document?.locale
          if (!locale) return {}
          return {
            filter: 'locale == $locale',
            params: {locale},
          }
        },
      },
      description: 'Case study to open when clicking the logo',
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
      title: 'name',
      media: 'logo',
    },
  },
})
