import {defineType} from 'sanity'

export const sectionTitle = defineType({
  name: 'sectionTitle',
  title: 'Section Title',
  type: 'object',
  fields: [
    {name: 'eyebrow', title: 'Eyebrow', type: 'string'},
    {name: 'title', title: 'Title', type: 'string'},
    {name: 'subtitle', title: 'Subtitle', type: 'string'},
  ],
  options: {collapsible: true, collapsed: false},
})
