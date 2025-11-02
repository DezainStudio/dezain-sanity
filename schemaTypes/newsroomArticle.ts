import { defineType } from 'sanity'
import { i18nSharedFields, slugifyLocale, isUniqueSlugWithinLocale, withI18nInitialValue } from './i18n'

export const newsroomArticle = defineType({
  name: 'newsroomArticle',
  title: 'Newsroom Article',
  type: 'document',
  initialValue: withI18nInitialValue({ featured: false, heroStyle: 'image', hideFromFeeds: false }),
  fields: [
    ...i18nSharedFields(),
    {
      name: 'title',
      title: 'Title (H1)',
      type: 'string',
      validation: (Rule) => Rule.required().max(110),
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
      name: 'dek',
      title: 'Dek (Short Summary)',
      type: 'text',
      validation: (Rule) => Rule.required().min(140).max(180),
    },
    { name: 'readMinutes', title: 'Read Minutes', type: 'number' },

    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'newsroomCategory' }],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'authors',
      title: 'Authors',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'creator' }] }],
    },
    {
      name: 'relatedServices',
      title: 'Related Services',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'serviceType' }] },
        { type: 'reference', to: [{ type: 'service' }] },
      ],
    },

    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    },
    { name: 'embargoAt', title: 'Embargo At', type: 'datetime' },
    { name: 'featured', title: 'Featured', type: 'boolean' },
    { name: 'pinUntil', title: 'Pin Until', type: 'datetime' },

    {
      name: 'heroStyle',
      title: 'Hero Style',
      type: 'string',
      options: { list: [ { title: 'Image', value: 'image' }, { title: 'Video', value: 'video' } ], layout: 'radio' },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'ALT', validation: (Rule) => Rule.required() },
        { name: 'caption', type: 'string', title: 'Caption' },
        { name: 'credit', type: 'string', title: 'Credit' },
      ],
      validation: (Rule) => Rule.custom((value, context) => {
        const heroStyle = (context as any)?.document?.heroStyle
        if (heroStyle === 'image' && !value) return 'Required when Hero Style is Image'
        return true
      }),
    },
    {
      name: 'heroVideo',
      title: 'Hero Video',
      type: 'object',
      fields: [
        {
          name: 'provider',
          title: 'Provider',
          type: 'string',
          options: { list: [ { title: 'File', value: 'file' }, { title: 'YouTube', value: 'youtube' }, { title: 'Vimeo', value: 'vimeo' } ] },
          validation: (Rule) => Rule.required(),
        },
        { name: 'url', title: 'URL', type: 'url' },
        { name: 'file', title: 'File', type: 'file' },
        { name: 'poster', title: 'Poster', type: 'image', options: { hotspot: true }, fields: [ { name: 'alt', type: 'string', title: 'ALT', validation: (Rule) => Rule.required() } ] },
        { name: 'transcript', title: 'Transcript', type: 'text' },
      ],
      validation: (Rule) => Rule.custom((val, context) => {
        const doc = (context as any)?.document
        if (doc?.heroStyle === 'video') {
          if (!val) return 'Required when Hero Style is Video'
          const v: any = val
          const provider = v?.provider
          if (provider === 'file' && !v?.file) return 'File is required when provider is File'
          if (provider !== 'file' && !v?.url) return 'URL is required when provider is YouTube or Vimeo'
          if (!v?.poster) return 'Poster is required for video'
        }
        return true
      }),
    },

    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Underline', value: 'underline' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'URL' },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'ALT', validation: (Rule) => Rule.required() },
            { name: 'caption', type: 'string', title: 'Caption' },
            { name: 'credit', type: 'string', title: 'Credit' },
          ],
        },
        {
          type: 'object',
          name: 'videoEmbed',
          title: 'Video Embed',
          fields: [
            {
              name: 'provider',
              title: 'Provider',
              type: 'string',
              options: { list: [ { title: 'File', value: 'file' }, { title: 'YouTube', value: 'youtube' }, { title: 'Vimeo', value: 'vimeo' } ] },
              validation: (Rule) => Rule.required(),
            },
            { name: 'url', title: 'URL', type: 'url' },
            { name: 'file', title: 'File', type: 'file' },
            { name: 'poster', title: 'Poster', type: 'image', options: { hotspot: true }, fields: [ { name: 'alt', type: 'string', title: 'ALT', validation: (Rule) => Rule.required() } ] },
            { name: 'transcript', title: 'Transcript', type: 'text' },
          ],
          validation: (Rule) => Rule.custom((val) => {
            if (!val) return true
            const v: any = val
            const provider = v?.provider
            if (provider === 'file' && !v?.file) return 'File is required when provider is File'
            if (provider !== 'file' && !v?.url) return 'URL is required when provider is YouTube or Vimeo'
            if (!v?.poster) return 'Poster is required for video'
            return true
          }),
        },
        {
          type: 'object',
          name: 'pullQuote',
          title: 'Pull Quote',
          fields: [
            { name: 'quote', title: 'Quote', type: 'text', validation: (Rule) => Rule.required() },
            { name: 'attribution', title: 'Attribution', type: 'string' },
            { name: 'role', title: 'Role', type: 'string' },
          ],
          preview: { select: { title: 'quote' } },
        },
        {
          type: 'object',
          name: 'ctaBlock',
          title: 'CTA Block',
          fields: [
            { name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'text', title: 'Text', type: 'string' },
            { name: 'buttonLabel', title: 'Button Label', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
          ],
          preview: { select: { title: 'title' } },
        },
      ],
    },

    {
      name: 'gallery',
      title: 'Gallery',
      type: 'object',
      fields: [
        {
          name: 'images',
          title: 'Images',
          type: 'array',
          of: [
            {
              type: 'image',
              options: { hotspot: true },
              fields: [
                { name: 'alt', type: 'string', title: 'ALT', validation: (Rule) => Rule.required() },
                { name: 'caption', type: 'string', title: 'Caption' },
                { name: 'credit', type: 'string', title: 'Credit' },
              ],
            },
          ],
          options: { layout: 'grid' },
        },
      ],
      options: { collapsible: true, collapsed: true },
    },

    {
      name: 'social',
      title: 'Social',
      type: 'object',
      fields: [
        { name: 'platform', title: 'Platform', type: 'string', options: { list: [ 'instagram', 'linkedin', 'x', 'tiktok', 'youtube' ] } },
        { name: 'handle', title: 'Handle', type: 'string' },
        { name: 'postUrl', title: 'Post URL', type: 'url' },
        { name: 'caption', title: 'Caption', type: 'text' },
        { name: 'media', title: 'Media', type: 'image', options: { hotspot: true }, fields: [ { name: 'alt', type: 'string', title: 'ALT', validation: (Rule) => Rule.required() } ] },
      ],
      validation: (Rule) => Rule.custom(async (val, context) => {
        const doc = (context as any)?.document
        const catRef = doc?.category?._ref
        if (!catRef) return true
        const client = (context as any).getClient({ apiVersion: '2024-05-01' })
        const cat = await client.fetch("*[_id == $id][0]{ slug: value.current }", { id: catRef })
        if (cat?.slug !== 'social') return true
        const s: any = val
        if (!s) return 'Required for Social category'
        if (!s.platform) return 'Platform is required for Social'
        if (!s.caption || s.caption.length < 70 || s.caption.length > 200) return 'Caption 70-200 chars required for Social'
        if (!s.postUrl && !s.media) return 'Either Post URL or Media is required for Social'
        return true
      }),
      options: { collapsible: true, collapsed: true },
    },

    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'metaTitle', title: 'Meta Title', type: 'string', validation: (Rule) => Rule.max(60) },
        { name: 'metaDescription', title: 'Meta Description', type: 'text', validation: (Rule) => Rule.max(155) },
        { name: 'canonical', title: 'Canonical URL', type: 'url' },
        { name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, fields: [ { name: 'alt', type: 'string', title: 'ALT', validation: (Rule) => Rule.required() } ] },
      ],
      options: { collapsible: true, collapsed: true },
    },

    { name: 'hideFromFeeds', title: 'Hide From Feeds', type: 'boolean' },
    { name: 'workflow', title: 'Workflow', type: 'string', options: { list: [ 'draft', 'inReview', 'approved', 'scheduled', 'published' ] } },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
      media: 'heroImage',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const { title, subtitle, media, publishedAt } = selection as any
      return {
        title,
        subtitle: subtitle || publishedAt,
        media,
      }
    },
  },
})
