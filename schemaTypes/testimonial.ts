import { defineType } from 'sanity'
import { i18nSharedFields, slugifyLocale, isUniqueSlugWithinLocale, withI18nInitialValue } from './i18n'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    { name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'surname', title: 'Surname', type: 'string', validation: (Rule) => Rule.required() },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: any) => `${doc?.name || ''} ${doc?.surname || ''}`.trim(),
        maxLength: 96,
        slugify: (input: string, _schemaType: any, context: any) => slugifyLocale(input, context?.document?.locale),
        isUnique: isUniqueSlugWithinLocale,
      },
      validation: (Rule) => Rule.required(),
    },
    { name: 'text', title: 'Testimonial Text', type: 'text' },
    {
      name: 'portfolioWork',
      title: 'Portfolio Work',
      type: 'reference',
      to: [{ type: 'portfolio' }],
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'ALT' }],
    },
    {
      name: 'companyLogo',
      title: 'Company Logo (1x1)',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'ALT' }],
    },
    {
      name: 'clientPhoto',
      title: 'Client Photo (1x1)',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'ALT' }],
    },
  ],
  preview: {
    select: {
      name: 'name',
      surname: 'surname',
      media: 'thumbnail',
      companyLogo: 'companyLogo',
    },
    prepare({ name, surname, media, companyLogo }) {
      return {
        title: [name, surname].filter(Boolean).join(' ') || 'Testimonial',
        media: media || companyLogo,
      }
    },
  },
})
