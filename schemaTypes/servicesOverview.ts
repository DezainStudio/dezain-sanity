import {defineType} from 'sanity'
import {i18nSharedFields, withI18nInitialValue} from './i18n'

export const servicesOverview = defineType({
  name: 'servicesOverview',
  title: 'Services Overview',
  type: 'document',
  initialValue: withI18nInitialValue(),
  fields: [
    ...i18nSharedFields(),
    {
      name: 'header',
      title: 'Header',
      type: 'object',
      fields: [
        {name: 'eyebrow', title: 'Small Title', type: 'string'},
        {name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()},
        {name: 'subtitle', title: 'Subtitle', type: 'string'},
        {name: 'primaryCta', title: 'Primary CTA', type: 'ctaLink'},
        {name: 'secondaryCta', title: 'Secondary CTA', type: 'ctaLink'},
      ],
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'allServicesCarousel',
      title: 'All Services Carousel',
      type: 'cardCarousel',
    },
    {
      name: 'sellingPoints',
      title: 'Selling Points',
      type: 'object',
      fields: [
        {name: 'header', title: 'Section Title', type: 'sectionTitle'},
        {
          name: 'cards',
          title: 'Cards (3 items)',
          type: 'array',
          of: [{type: 'iconCard'}],
          validation: (Rule) => Rule.min(3).max(3),
        },
      ],
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'testimonialsHeader',
      title: 'Testimonials Header',
      type: 'sectionTitle',
    },
    {
      name: 'process',
      title: 'Process',
      type: 'object',
      fields: [
        {name: 'header', title: 'Section Title', type: 'sectionTitle'},
        {
          name: 'steps',
          title: 'Steps',
          type: 'array',
          of: [{type: 'iconCard'}],
        },
      ],
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'deliverablesSection',
      title: 'Deliverables Section',
      type: 'object',
      fields: [
        {name: 'eyebrow', title: 'Eyebrow', type: 'string'},
        {name: 'title', title: 'Title', type: 'string'},
        {
          name: 'defaultServiceType',
          title: 'Default Service Type',
          type: 'reference',
          to: [{type: 'serviceType'}],
        },
      ],
      options: {collapsible: true, collapsed: false},
    },
  ],
})
