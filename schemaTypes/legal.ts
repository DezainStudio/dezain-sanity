import {defineType} from 'sanity'
import {
  i18nSharedFields,
  slugifyLocale,
  isUniqueSlugWithinLocale,
  withI18nInitialValue,
} from './i18n'

export const legal = defineType({
  name: 'legal',
  title: 'Legal',
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
        slugify: (input: string, _schemaType: any, context: any) =>
          slugifyLocale(input, context?.document?.locale),
        isUnique: isUniqueSlugWithinLocale,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
              {title: 'Underline', value: 'underline'},
              {title: 'Strike', value: 'strike-through'},
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
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      updatedAt: 'updatedAt',
    },
    prepare(selection) {
      const {title, updatedAt} = selection
      return {
        title: title || 'Legal',
        subtitle: updatedAt ? `Updated ${new Date(updatedAt).toLocaleDateString()}` : undefined,
      }
    },
  },
})
