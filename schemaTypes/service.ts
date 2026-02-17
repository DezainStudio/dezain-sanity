import {defineType} from 'sanity'
import {
  i18nSharedFields,
  slugifyLocale,
  isUniqueSlugWithinLocale,
  withI18nInitialValue,
} from './i18n'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    {
      name: 'title',
      title: 'Title (H1)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string, _schemaType: any, context: any) =>
          slugifyLocale(input, context?.document?.locale),
        isUnique: isUniqueSlugWithinLocale,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'serviceType',
      title: 'Service Type',
      type: 'reference',
      to: [{type: 'serviceType'}],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      description: 'Optional manual ordering (lower appears first)',
    },
    {
      name: 'header',
      title: 'Header',
      type: 'object',
      fields: [
        {name: 'eyebrow', title: 'Small Title', type: 'string'},
        {name: 'subtitle', title: 'Subtitle', type: 'string'},
        {name: 'primaryCta', title: 'Primary CTA', type: 'ctaLink'},
        {name: 'secondaryCta', title: 'Secondary CTA', type: 'ctaLink'},
      ],
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'media',
      title: 'Media (Photo / Video)',
      description: 'Add either an image or a reference to a video',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [{name: 'alt', type: 'string', title: 'ALT'}],
        },
        {type: 'reference', to: [{type: 'video'}]},
      ],
      validation: (Rule) => Rule.max(1),
    },

    {
      name: 'sellingPoints',
      title: 'Selling Points',
      type: 'object',
      fields: [
        {name: 'header', title: 'Section Title', type: 'sectionTitle'},
        {
          name: 'cards',
          title: 'Cards (3 items)',
          type: 'array',
          of: [{type: 'iconCard'}],
          validation: (Rule) => Rule.min(3).max(3),
        },
      ],
      options: {collapsible: true, collapsed: false},
    },

    {
      name: 'deliverables',
      title: 'Deliverables',
      type: 'object',
      fields: [
        {name: 'header', title: 'Section Title', type: 'sectionTitle'},
        {
          name: 'items',
          title: 'Deliverables',
          type: 'array',
          of: [{type: 'serviceDeliverable'}],
        },
      ],
      options: {collapsible: true, collapsed: false},
    },

    {
      name: 'process',
      title: 'Process',
      type: 'object',
      fields: [
        {name: 'header', title: 'Section Title', type: 'sectionTitle'},
        {
          name: 'steps',
          title: 'Steps',
          type: 'array',
          of: [{type: 'iconCard'}],
        },
      ],
      options: {collapsible: true, collapsed: false},
    },

    {
      name: 'relatedWork',
      title: 'Related Work',
      type: 'object',
      fields: [
        {
          name: 'mode',
          title: 'Mode',
          type: 'string',
          options: {
            list: [
              {title: 'Auto', value: 'auto'},
              {title: 'Manual', value: 'manual'},
            ],
            layout: 'radio',
            direction: 'horizontal',
          },
          initialValue: 'auto',
        },
        {
          name: 'items',
          title: 'Manual Items (max 3)',
          type: 'array',
          of: [
            {
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
            },
          ],
          validation: (Rule) => Rule.max(3),
        },
      ],
      options: {collapsible: true, collapsed: false},
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
  },
})
