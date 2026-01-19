import {defineType} from 'sanity'
import {
  i18nSharedFields,
  withI18nInitialValue,
  slugifyLocale,
  isUniqueSlugWithinLocale,
} from './i18n'

export const landing = defineType({
  name: 'landing',
  title: 'Landing',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    {
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        {name: 'title', title: 'Title (H1)', type: 'string', validation: (Rule) => Rule.required()},
        {name: 'subtitle', title: 'Subtitle (H2)', type: 'string'},
        {name: 'primaryCta', title: 'Primary CTA', type: 'ctaLink'},
        {name: 'ctaText', title: 'CTA Text', type: 'string'},
        {name: 'ctaLink', title: 'CTA Link', type: 'string'},
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {hotspot: true},
          fields: [{name: 'alt', type: 'string', title: 'ALT'}],
        },
      ],
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'sellingPoints',
      title: 'Selling Points',
      type: 'cardCarousel',
    },
    {
      name: 'trustedBy',
      title: 'Trusted By Logos',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'trustedBy'}],
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
        },
      ],
    },
    {
      name: 'imageCta',
      title: 'Image CTA',
      type: 'imageCTA',
    },
    {
      name: 'consultation',
      title: 'Consultation Section',
      type: 'object',
      fields: [
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {hotspot: true},
          fields: [{name: 'alt', type: 'string', title: 'ALT'}],
        },
        {name: 'title', title: 'Title', type: 'string'},
        {name: 'description', title: 'Description', type: 'text'},
        {name: 'buttonText', title: 'Button Text', type: 'string'},
        {name: 'buttonLink', title: 'Button Link', type: 'url'},
      ],
      options: {collapsible: true, collapsed: false},
    },
  ],
})
