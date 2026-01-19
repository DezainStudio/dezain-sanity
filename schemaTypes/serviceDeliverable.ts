import {defineType} from 'sanity'

export const serviceDeliverable = defineType({
  name: 'serviceDeliverable',
  title: 'Service Deliverable',
  type: 'object',
  fields: [
    {name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()},
    {name: 'shortDescription', title: 'Short Description', type: 'string'},
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'ALT'}],
    },
    {name: 'order', title: 'Sort Order', type: 'number'},
    {name: 'showInCarousel', title: 'Show In Carousel', type: 'boolean', initialValue: true},
  ],
  preview: {select: {title: 'title', media: 'image'}},
})
