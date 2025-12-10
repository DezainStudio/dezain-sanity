import { defineType } from 'sanity'
import { i18nSharedFields, slugifyLocale, isUniqueSlugWithinLocale, withI18nInitialValue } from './i18n'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    // Section 1
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
        slugify: (input: string, _schemaType: any, context: any) => slugifyLocale(input, context?.document?.locale),
        isUnique: isUniqueSlugWithinLocale,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'serviceType',
      title: 'Service Type',
      type: 'reference',
      to: [{ type: 'serviceType' }],
      validation: (Rule) => Rule.required(),
    },
    { name: 'subtitle', title: 'Subtitle (H2)', type: 'string' },
    {
      name: 'description',
      title: 'Description (max 140 chars)',
      type: 'text',
      validation: (Rule) => Rule.max(140),
    },
    { name: 'buttonTitle', title: 'Button Title', type: 'string' },
    { name: 'buttonUrl', title: 'Button Link URL', type: 'url' },
    {
      name: 'buttonVariant',
      title: 'Button Type',
      type: 'string',
      options: { list: [ { title: 'Primary', value: 'primary' }, { title: 'Secondary', value: 'secondary' } ] },
    },
    {
      name: 'media',
      title: 'Media (Photo / Video)',
      description: 'Add either an image or a reference to a video',
      type: 'array',
      of: [
        { type: 'image', options: { hotspot: true }, fields: [ { name: 'alt', type: 'string', title: 'ALT' } ] },
        { type: 'reference', to: [{ type: 'video' }] },
      ],
      validation: (Rule) => Rule.max(1),
    },

    // Section 2
    { name: 'section2Title', title: 'Section 2 Title (H2)', type: 'string' },
    {
      name: 'section2Body',
      title: 'Section 2 Body',
      type: 'array',
      of: [ { type: 'block' } ],
    },
    {
      name: 'section2Image',
      title: 'Section 2 Image (1x1)',
      type: 'image',
      options: { hotspot: true },
      fields: [ { name: 'alt', type: 'string', title: 'ALT' } ],
    },

    // Section 3
    { name: 'section3Title', title: 'Section 3 Title (H2)', type: 'string' },
    { name: 'section3Subtitle', title: 'Section 3 Subtitle (H3)', type: 'string' },
    {
      name: 'section3Cards',
      title: 'Section 3 Cards (3 items)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'card',
          fields: [
            { name: 'icon', title: 'Icon (SVG)', type: 'file', options: { accept: 'image/svg+xml' } },
            { name: 'iconDark', title: 'Icon (SVG) - Dark Mode', type: 'file', options: { accept: 'image/svg+xml' } },
            { name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'text', title: 'Text (max 100 chars)', type: 'string', validation: (Rule) => Rule.max(100) },
          ],
          preview: { select: { title: 'title' } },
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
    { name: 'section4Title', title: 'Section 4 Title (Our approach) (H2)', type: 'string' },
    { name: 'section4TitlePrimary', title: 'Section 4 Title Primary (H3)', type: 'string' },
    { name: 'section4TitleMuted', title: 'Section 4 Title Muted (H3)', type: 'string' },
    {
      name: 'section4Cards',
      title: 'Section 4 Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'approachCard',
          fields: [
            { name: 'image', title: 'Image (PNG)', type: 'image', options: { hotspot: true }, fields: [ { name: 'alt', type: 'string', title: 'ALT' } ] },
            { name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'subtitle', title: 'Subtitle (max 60 chars)', type: 'string', validation: (Rule) => Rule.max(60) },
          ],
          preview: { select: { title: 'title' } },
        },
      ],
    },

    // Section 5
    { name: 'section5Title', title: 'Section 5 Title (process) (H2)', type: 'string' },
    { name: 'section5Subtitle', title: 'Section 5 Subtitle (Marketing Title) (H3)', type: 'string' },
    { name: 'section5Subheading', title: 'Section 5 Subheading (H4)', type: 'string' },
    {
      name: 'section5Cards',
      title: 'Section 5 Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'processCard',
          fields: [
            { name: 'icon', title: 'Icon (SVG)', type: 'file', options: { accept: 'image/svg+xml' } },
            { name: 'iconDark', title: 'Icon (SVG) - Dark Mode', type: 'file', options: { accept: 'image/svg+xml' } },
            { name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'text', title: 'Text (max 100 chars)', type: 'string', validation: (Rule) => Rule.max(100) },
          ],
          preview: { select: { title: 'title' } },
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
