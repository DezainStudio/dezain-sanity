// Seed core UI dictionary keys (nav, footer, landing, 404, cookie banner)
// into per-locale dictionary entries so the frontend can look up localized labels.
//
// Usage (from dezain-sanity/):
//   SANITY_PROJECT_ID=... SANITY_DATASET=production SANITY_TOKEN=... node seedDictionaryKeys.js
//
// The script is idempotent: it only ADDS missing keys; it never overwrites existing values.

import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_TOKEN

if (!projectId || !dataset || !token) {
  console.error('Missing SANITY_PROJECT_ID, SANITY_DATASET, or SANITY_TOKEN environment variables')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-05-01',
  token,
  useCdn: false,
})

// Locales to update. You can override via SANITY_ACTIVE_LOCALES (e.g. "en,lv").
const ACTIVE_LOCALES = (process.env.SANITY_ACTIVE_LOCALES || 'en,lv')
  .split(',')
  .map((l) => l.trim())
  .filter(Boolean)

// Static UI keys we want to ensure exist in every dictionary document.
// Values are seeded in English and can be translated per-locale in Studio later.
const STATIC_DICTIONARY_KEYS = [
  // Navigation
  {key: 'nav.portfolio', value: 'Portfolio'},

  // Landing / homepage portfolio section
  {key: 'landing.portfolio.heading', value: 'Explore portfolio'},
  {key: 'landing.portfolio.openButton', value: 'Open portfolio'},

  // Portfolio: filters, sort, and view mode
  {key: 'portfolio.filters.filterLabel', value: 'Filter'},
  {key: 'portfolio.filters.all', value: 'All'},
  {key: 'portfolio.filters.clientTypeHeading', value: 'Type of Client'},
  {key: 'portfolio.filters.workTypeHeading', value: 'Type of Work'},
  {key: 'portfolio.filters.clearAll', value: 'Clear All'},
  {key: 'portfolio.filters.cancel', value: 'Cancel'},
  {key: 'portfolio.filters.modalTitle', value: 'Filter'},

  {key: 'portfolio.sort.sortLabel', value: 'Sort'},
  {key: 'portfolio.sort.modalTitle', value: 'Sort by'},
  {key: 'portfolio.sort.newest', value: 'Newest → Oldest'},
  {key: 'portfolio.sort.oldest', value: 'Oldest → Newest'},
  {key: 'portfolio.sort.az', value: 'Alphabetical (A–Z)'},
  {key: 'portfolio.sort.za', value: 'Alphabetical (Z–A)'},
  {key: 'portfolio.sort.apply', value: 'Apply'},

  {key: 'portfolio.view.gridAria', value: 'Grid view'},
  {key: 'portfolio.view.listAria', value: 'List view'},

  // Footer
  {key: 'footer.termsOfUse', value: 'Terms of Use'},
  {key: 'footer.privacyPolicy', value: 'Privacy Policy'},
  {key: 'footer.cookiePolicy', value: 'Cookie Policy'},
  {key: 'footer.manageCookies', value: 'Manage Cookies'},

  // 404 page
  {key: '404.text', value: "The page you're looking for can't be found."},
  {key: '404.goToHome', value: 'Go to Homepage'},

  // Cookie banner (bottom banner)
  {key: 'cookieBanner.title', value: 'Cookie settings and consent'},
  {
    key: 'cookieBanner.description',
    value:
      'We use necessary cookies to run the site. With your consent, we also use analytics (GA4) and marketing (Meta Pixel). You can change your choices any time in Cookie settings. Consent is stored for 6 months.',
  },
  {key: 'cookieBanner.acceptAll', value: 'Accept all'},
  {key: 'cookieBanner.rejectAll', value: 'Reject all'},
  {key: 'cookieBanner.manageCookies', value: 'Manage settings'},
  {key: 'cookieBanner.privacyPolicy', value: 'Privacy Policy'},
  {key: 'cookieBanner.cookiePolicy', value: 'Cookie Policy'},

  // Cookie preferences popup
  {key: 'cookieBanner.popup.title', value: 'Cookie settings'},
  {
    key: 'cookieBanner.popup.description',
    value:
      'Your choices apply to this device and browser for 6 months. You can change them any time.',
  },
  {
    key: 'cookieBanner.popup.strictlyNecessaryTitle',
    value: 'Strictly Necessary Cookies',
  },
  {
    key: 'cookieBanner.popup.strictlyNecessaryDesc',
    value: 'Required for core functions, security, and to remember your cookie choices.',
  },
  {key: 'cookieBanner.popup.preferencesTitle', value: 'Preferences'},
  {key: 'cookieBanner.popup.preferencesDesc', value: 'Remember language and page settings.'},
  {key: 'cookieBanner.popup.analyticsTitle', value: 'Analytics'},
  {
    key: 'cookieBanner.popup.analyticsDesc',
    value:
      'Help us measure usage and improve the site. GA4 uses pseudonymous identifiers and IP anonymization.',
  },
  {key: 'cookieBanner.popup.marketingTitle', value: 'Marketing'},
  {
    key: 'cookieBanner.popup.marketingDesc',
    value: 'Measure ad performance and build aggregated audiences on Meta platforms.',
  },
  {key: 'cookieBanner.popup.saveChoices', value: 'Save choices'},
  {key: 'cookieBanner.popup.acceptAll', value: 'Accept all'},
]

async function fetchDictionaryForLocale(locale) {
  const doc = await client.fetch(
    '*[_type == "dictionary" && locale == $locale] | order(_updatedAt desc)[0]',
    {locale},
  )

  if (!doc) {
    console.warn(`No dictionary document found for locale "${locale}". Skipping.`)
    return null
  }

  return doc
}

async function seedLocale(locale) {
  const dictionary = await fetchDictionaryForLocale(locale)
  if (!dictionary) return

  const existingKeys = new Set((dictionary.entries || []).map((entry) => entry.key))
  const entriesToAppend = []

  for (const item of STATIC_DICTIONARY_KEYS) {
    if (existingKeys.has(item.key)) continue

    entriesToAppend.push({
      _type: 'entry',
      key: item.key,
      value: item.value,
      notes: 'seeded static UI copy',
    })
    existingKeys.add(item.key)
  }

  if (!entriesToAppend.length) {
    console.log(`Locale ${locale}: no new static keys to add.`)
    return
  }

  console.log(
    `Locale ${locale}: adding ${entriesToAppend.length} static keys to dictionary ${dictionary._id}`,
  )

  await client
    .patch(dictionary._id)
    .setIfMissing({entries: []})
    .insert('after', 'entries[-1]', entriesToAppend)
    .commit()
}

async function main() {
  console.log('Starting static UI dictionary key seeding')
  console.log('Locales:', ACTIVE_LOCALES.join(', '))

  for (const locale of ACTIVE_LOCALES) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await seedLocale(locale)
    } catch (err) {
      console.error(`Failed to seed locale ${locale}:`, err)
    }
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
