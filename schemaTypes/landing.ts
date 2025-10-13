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
        {name: 'ctaText', title: 'CTA Text', type: 'string'},
        {name: 'ctaLink', title: 'CTA Link', type: 'url'},
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
      name: 'imageCta',
      title: 'Image CTA',
      type: 'imageCTA',
    },
  ],
})
