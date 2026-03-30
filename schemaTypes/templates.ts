export const templates = [
  {
    id: 'landing-by-locale',
    title: 'Landing (by locale)',
    schemaType: 'landing',
    parameters: [{name: 'locale', type: 'string'}],
    value: (params: {locale?: string}) => ({
      locale: params?.locale,
    }),
  },
  {
    id: 'servicesOverview-by-locale',
    title: 'Services Overview (by locale)',
    schemaType: 'servicesOverview',
    parameters: [{name: 'locale', type: 'string'}],
    value: (params: {locale?: string}) => ({
      locale: params?.locale,
    }),
  },
  {
    id: 'mailingPage-by-locale',
    title: 'Mailing Page (by locale)',
    schemaType: 'mailingPage',
    parameters: [{name: 'locale', type: 'string'}],
    value: (params: {locale?: string}) => ({
      locale: params?.locale,
    }),
  },
]
