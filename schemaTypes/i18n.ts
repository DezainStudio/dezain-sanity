import type {SlugValue} from 'sanity'

// Locales
export const DEFAULT_LOCALE = 'en'
export const ACTIVE_LOCALES =
  process.env.SANITY_ACTIVE_LOCALES?.split(',') ||
  (['en', 'lv', 'lt', 'et', 'pl', 'de', 'fr', 'es', 'it'] as const)
export type Locale = (typeof ACTIVE_LOCALES)[number]

// Basic latinize + kebab-case slugifier
export function slugifyLocale(input: string, _locale?: string): string {
  if (!input) return ''
  const s = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return s
}

// Ensure slug uniqueness within the same type + locale
export async function isUniqueSlugWithinLocale(
  slugValue: SlugValue | string,
  context: {document: any; getClient: (opts: {apiVersion: string}) => any},
): Promise<boolean> {
  const {document, getClient} = context
  const slugCurrent = typeof slugValue === 'string' ? slugValue : slugValue?.current
  if (!slugCurrent) return true

  const id = document?._id?.replace('drafts.', '')
  const type = document?._type
  const locale = document?.locale || DEFAULT_LOCALE

  const client = getClient({apiVersion: '2024-05-01'})
  const params = {slug: slugCurrent, id, type, locale}
  const query = `count(*[_type == $type && locale == $locale && slug.current == $slug && !(_id in [$id, 'drafts.' + $id])])`
  const count = (await client.fetch(query, params)) as number
  return count === 0
}

// Shared i18n fields to prepend to document schemas
export function i18nSharedFields() {
  return [
    {
      name: 'locale',
      type: 'string',
      title: 'Locale',
      initialValue: DEFAULT_LOCALE,
      options: {
        list: ACTIVE_LOCALES.map((l) => ({title: l.toUpperCase(), value: l})),
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'translationKey',
      type: 'string',
      title: 'Translation Key',
      description: 'Sibling documents across locales share the same UUID',
      readOnly: true,
    },
    {name: 'sourceDocId', type: 'string', title: 'Source Doc ID', readOnly: true},
    {
      name: 'sourceHash',
      type: 'string',
      title: 'Source Hash',
      description: 'Hash of source text used for machine translation memory',
      readOnly: true,
    },
    {
      name: 'translationMeta',
      type: 'object',
      title: 'Translation Metadata',
      fields: [
        {name: 'provider', type: 'string', options: {list: ['openai']}},
        {name: 'status', type: 'string', options: {list: ['machine', 'edited', 'approved']}},
        {name: 'createdAt', type: 'datetime'},
        {name: 'reviewer', type: 'string'},
      ],
      options: {collapsible: true, collapsed: true},
    },
  ]
}

// Helper to generate an initialValue for docs (sets translationKey if absent)
export function withI18nInitialValue<T extends Record<string, any>>(base?: T) {
  return () => ({
    locale: DEFAULT_LOCALE,
    translationKey: (globalThis as any)?.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    ...(base || {}),
  })
}
