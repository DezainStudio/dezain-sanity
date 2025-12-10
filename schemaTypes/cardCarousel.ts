import {defineType} from 'sanity'

export const cardCarousel = defineType({
  name: 'cardCarousel',
  title: 'Card Carousel',
  type: 'object',
  fields: [
    {name: 'title', title: 'Title (H2)', type: 'string'},
    {name: 'subtitle', title: 'Subtitle (H3)', type: 'string'},
    {
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'carouselCard',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
              fields: [{name: 'alt', type: 'string', title: 'ALT'}],
            },
            {name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()},
            {
              name: 'text',
              title: 'Text',
              type: 'string',
              validation: (Rule) => Rule.max(100),
            },
          ],
          preview: {select: {title: 'title', media: 'image'}},
        },
      ],
    },
  ],
  options: {collapsible: true, collapsed: false},
})
