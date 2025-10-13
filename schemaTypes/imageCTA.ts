import {defineType} from 'sanity'

export const imageCTA = defineType({
  name: 'imageCTA',
  title: 'Image CTA',
  type: 'object',
  fields: [
    {
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'ALT'}],
    },
    {name: 'title', title: 'Title (H2)', type: 'string'},
    {name: 'subtitle', title: 'Subtitle (H3)', type: 'string'},
    {
      name: 'primaryButton',
      title: 'Primary Button',
      type: 'object',
      fields: [
        {name: 'text', title: 'Text', type: 'string'},
        {name: 'link', title: 'Link', type: 'url'},
      ],
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'secondaryButton',
      title: 'Secondary Button',
      type: 'object',
      fields: [
        {name: 'text', title: 'Text', type: 'string'},
        {name: 'link', title: 'Link', type: 'url'},
      ],
      options: {collapsible: true, collapsed: true},
    },
  ],
  options: {collapsible: true, collapsed: false},
})
