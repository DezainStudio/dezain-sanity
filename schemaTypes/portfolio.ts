import { defineType } from 'sanity'
import { i18nSharedFields, slugifyLocale, isUniqueSlugWithinLocale, withI18nInitialValue } from './i18n'

export const portfolio = defineType({
  name: 'portfolio',
  title: 'Portfolio',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    {
      name: 'title',
      title: 'Title',
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
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' }
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' }
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL'
                  }
                ]
              }
            ],
          },
        },
        {
          type: 'image',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Caption displayed below the image'
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for SEO and accessibility'
            }
          ]
        },
        {
          type: 'video',
        },
        {
          name: 'gallery',
          type: 'object',
          title: 'Gallery',
          fields: [
            {
              name: 'images',
              type: 'array',
              title: 'Images',
              of: [
                {
                  type: 'image',
                  options: {
                    hotspot: true
                  },
                  fields: [
                    {
                      name: 'caption',
                      type: 'string',
                      title: 'Caption',
                      description: 'Caption for this image'
                    },
                    {
                      name: 'alt',
                      type: 'string',
                      title: 'Alternative text',
                      description: 'Important for SEO and accessibility'
                    }
                  ]
                }
              ],
              options: {
                layout: 'grid'
              }
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Gallery Caption',
              description: 'Caption for the entire gallery'
            }
          ],
          preview: {
            select: {
              images: 'images',
              caption: 'caption'
            },
            prepare(selection) {
              const {images, caption} = selection
              return {
                title: caption || 'Gallery',
                subtitle: `Gallery with ${images ? images.length : 0} image(s)`,
                media: images && images.length > 0 ? images[0] : null
              }
            }
          }
        },
      ],
    },
    {
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'serviceType' }],
      }],
    },
    {
      name: 'creators',
      title: 'Creators',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'creator' }],
      }],
    },
    {
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
    },
    {
      name: 'workType',
      title: 'Types of Work',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'workType' }],
      }],
    },
    {
      name: 'clientType',
      title: 'Types of Client',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'clientType' }],
      }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'coverImage',
      slug: 'slug',
    },
    prepare(selection) {
      const { title, subtitle, media, slug } = selection
      return {
        title,
        subtitle: subtitle || 'Portfolio Project',
        media,
        slug,
      }
    },
  },
})
