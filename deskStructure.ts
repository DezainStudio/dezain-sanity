import {StructureBuilder} from 'sanity/structure'
import {ACTIVE_LOCALES} from './schemaTypes/i18n'

const LOCALE_FLAGS: Record<string, string> = {
  en: '🇬🇧',
  lv: '🇱🇻',
  lt: '🇱🇹',
  et: '🇪🇪',
  pl: '🇵🇱',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  it: '🇮🇹',
}

const localizedTypes: Array<{type: string; title: string}> = [
  {type: 'siteSettings', title: 'Site Settings'},
  {type: 'dictionary', title: 'Dictionary'},
  {type: 'service', title: 'Services'},
  {type: 'portfolio', title: 'Portfolio'},
  {type: 'creator', title: 'Team'},
  {type: 'legal', title: 'Legal'},
  {type: 'testimonial', title: 'Testimonials'},
  {type: 'video', title: 'Videos'},
  {type: 'redirect', title: 'Redirects'},
]

const taxonomyTypes: Array<{type: string; title: string}> = [
  {type: 'skill', title: 'Skills'},
  {type: 'workType', title: 'Work Types'},
  {type: 'clientType', title: 'Client Types'},
  {type: 'serviceType', title: 'Service Types'},
]

export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Group by Locale at the top level
      ...ACTIVE_LOCALES.map((loc) =>
        S.listItem()
          .title(`${LOCALE_FLAGS[loc] ?? '🌐'} ${loc.toUpperCase()}`)
          .child(
            S.list()
              .title(`${loc.toUpperCase()} Content`)
              .items([
                // Singleton Landing per locale
                S.listItem()
                  .title('Landing')
                  .child(
                    S.document()
                      .schemaType('landing')
                      .documentId(`landing-${loc}`)
                      .initialValueTemplate('landing-by-locale', { locale: loc }),
                  ),
                // Other localized types (lists)
                ...localizedTypes.map((t) =>
                  S.listItem()
                    .title(t.title)
                    .child(
                      S.documentList()
                        .id(`${t.type}-${loc}`)
                        .title(t.title)
                        .filter('_type == $type && locale == $locale')
                        .params({type: t.type, locale: loc}),
                    ),
                ),
              ]),
          ),
      ),
      S.divider(),
      // Non-localized: Taxonomies and Glossary
      S.listItem()
        .title('Taxonomies')
        .child(
          S.list()
            .title('Taxonomies')
            .items([
              ...taxonomyTypes.map((t) => S.documentTypeListItem(t.type).title(t.title)),
              S.listItem()
                .title('Glossary')
                .child(S.documentTypeList('glossaryTerm').title('Glossary')),
            ]),
        ),
    ])
