import { defineType } from 'sanity'

export const creator = defineType({
  name: 'creator',
  title: 'Creator',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    },
    {
      name: 'profileImage',
      title: 'Profile Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'skill' }],
      }],
    },
    // Portfolio works are referenced from the portfolio schema
    // This is a one-way relationship
  ],
  preview: {
    select: {
      title: 'name',
      media: 'profileImage',
      slug: 'slug',
    },
    prepare(selection) {
      return {
        title: selection.title,
        media: selection.media,
      }
    },
  },
})
