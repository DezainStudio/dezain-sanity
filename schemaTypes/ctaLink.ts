import {defineType} from 'sanity'

export const ctaLink = defineType({
  name: 'ctaLink',
  title: 'CTA Link',
  type: 'object',
  fields: [
    {name: 'text', title: 'Text', type: 'string'},
    {name: 'link', title: 'Link', type: 'url'},
    {name: 'withArrow', title: 'With Arrow', type: 'boolean'},
  ],
  options: {collapsible: true, collapsed: false},
})
