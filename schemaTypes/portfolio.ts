import { defineType } from 'sanity'

export const portfolio = defineType({
  name: 'portfolio',
  title: 'Portfolio',
  type: 'document',
  fields: [
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
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [],
            annotations: [],
          },
        },
        {
          type: 'image',
        },
        {
          type: 'video',
        },
      ],
    },
    {
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'service' }],
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
      title: 'Type of Work',
      type: 'reference',
      to: [{ type: 'workType' }],
    },
    {
      name: 'clientType',
      title: 'Type of Client',
      type: 'reference',
      to: [{ type: 'clientType' }],
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
