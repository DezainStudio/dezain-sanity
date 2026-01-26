import {defineType} from 'sanity'

export const iconCard = defineType({
  name: 'iconCard',
  title: 'Icon Card',
  type: 'object',
  fields: [
    {name: 'icon', title: 'Icon', type: 'file', options: {accept: 'image/svg+xml'}},
    {name: 'title', title: 'Title', type: 'string'},
    {name: 'description', title: 'Description', type: 'string'},
  ],
  preview: {select: {title: 'title'}},
})
