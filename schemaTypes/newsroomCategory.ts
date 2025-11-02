import {defineType} from 'sanity'

export const newsroomCategory = defineType({
  name: 'newsroomCategory',
  title: 'Newsroom Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'value',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'icon',
      title: 'SVG Icon',
      type: 'file',
      options: {accept: 'image/svg+xml'},
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'value.current',
      media: 'icon',
    },
  },
})
