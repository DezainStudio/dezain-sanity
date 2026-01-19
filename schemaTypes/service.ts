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
    {name: 'subtitle', title: 'Subtitle (H2)', type: 'string'},
    {
      name: 'description',
      title: 'Description (max 140 chars)',
      type: 'text',
      validation: (Rule) => Rule.max(140),
    },
    {name: 'buttonTitle', title: 'Button Title', type: 'string'},
    {name: 'buttonUrl', title: 'Button Link URL', type: 'url'},
    {
      name: 'buttonVariant',
      title: 'Button Type',
      type: 'string',
      options: {
        list: [
          {title: 'Primary', value: 'primary'},
          {title: 'Secondary', value: 'secondary'},
        ],
      },
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

    // Section 2
    {name: 'section2Title', title: 'Section 2 Title (H2)', type: 'string'},
    {
      name: 'section2Body',
      title: 'Section 2 Body',
      type: 'array',
      of: [{type: 'block'}],
    },
    {
      name: 'section2Image',
      title: 'Section 2 Image (1x1)',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'ALT'}],
    },

    // Section 3
    {name: 'section3Title', title: 'Section 3 Title (H2)', type: 'string'},
    {name: 'section3Subtitle', title: 'Section 3 Subtitle (H3)', type: 'string'},
    {
      name: 'section3Cards',
      title: 'Section 3 Cards (3 items)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'card',
          fields: [
            {name: 'icon', title: 'Icon (SVG)', type: 'file', options: {accept: 'image/svg+xml'}},
            {
              name: 'iconDark',
              title: 'Icon (SVG) - Dark Mode',
              type: 'file',
              options: {accept: 'image/svg+xml'},
            },
            {name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()},
            {
              name: 'text',
              title: 'Text (max 100 chars)',
              type: 'string',
              validation: (Rule) => Rule.max(100),
            },
          ],
          preview: {select: {title: 'title'}},
        },
      ],
      validation: (Rule) => Rule.min(3).max(3),
    },

    // Optional Card Carousel (reusable block)
    {
      name: 'cardCarousel',
      title: 'Card Carousel',
      type: 'cardCarousel',
    },

    // Section 4
    {name: 'section4Title', title: 'Section 4 Title (Our approach) (H2)', type: 'string'},
    {name: 'section4TitlePrimary', title: 'Section 4 Title Primary (H3)', type: 'string'},
    {name: 'section4TitleMuted', title: 'Section 4 Title Muted (H3)', type: 'string'},
    {
      name: 'section4Cards',
      title: 'Section 4 Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'approachCard',
          fields: [
            {
              name: 'image',
              title: 'Image (PNG)',
              type: 'image',
              options: {hotspot: true},
              fields: [{name: 'alt', type: 'string', title: 'ALT'}],
            },
            {name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()},
            {
              name: 'subtitle',
              title: 'Subtitle (max 60 chars)',
              type: 'string',
              validation: (Rule) => Rule.max(60),
            },
          ],
          preview: {select: {title: 'title'}},
        },
      ],
    },

    // Section 5
    {name: 'section5Title', title: 'Section 5 Title (process) (H2)', type: 'string'},
    {name: 'section5Subtitle', title: 'Section 5 Subtitle (Marketing Title) (H3)', type: 'string'},
    {name: 'section5Subheading', title: 'Section 5 Subheading (H4)', type: 'string'},
    {
      name: 'section5Cards',
      title: 'Section 5 Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'processCard',
          fields: [
            {name: 'icon', title: 'Icon (SVG)', type: 'file', options: {accept: 'image/svg+xml'}},
            {
              name: 'iconDark',
              title: 'Icon (SVG) - Dark Mode',
              type: 'file',
              options: {accept: 'image/svg+xml'},
            },
            {name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()},
            {
              name: 'text',
              title: 'Text (max 100 chars)',
              type: 'string',
              validation: (Rule) => Rule.max(100),
            },
          ],
          preview: {select: {title: 'title'}},
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
  },
})
