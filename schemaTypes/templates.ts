export const templates = [
  {
    id: 'landing-by-locale',
    title: 'Landing (by locale)',
    schemaType: 'landing',
    parameters: [{ name: 'locale', type: 'string' }],
    value: (params: { locale?: string }) => ({
      locale: params?.locale,
    }),
  },
]
