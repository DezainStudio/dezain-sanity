// Sync non-localized taxonomy documents (serviceType, workType, clientType, skill)
// into per-locale dictionary entries so UI can look up localized labels by key.
//
// Usage (from dezain-sanity/):
//   SANITY_PROJECT_ID=... SANITY_DATASET=production SANITY_TOKEN=... node syncTaxonomiesToDictionary.js
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

const TAXONOMY_TYPES = [
  {type: 'serviceType', prefix: 'taxonomy.service'},
  {type: 'workType', prefix: 'taxonomy.workType'},
  {type: 'clientType', prefix: 'taxonomy.clientType'},
  {type: 'skill', prefix: 'taxonomy.skill'},
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

async function syncLocale(locale) {
  const dictionary = await fetchDictionaryForLocale(locale)
  if (!dictionary) return

  const existingKeys = new Set((dictionary.entries || []).map((entry) => entry.key))
  const entriesToAppend = []

  for (const tax of TAXONOMY_TYPES) {
    const docs = await client.fetch('*[_type == $type]{ _id, title, "slug": value.current }', {
      type: tax.type,
    })

    if (!Array.isArray(docs) || docs.length === 0) continue

    for (const doc of docs) {
      if (!doc?.slug) continue
      const key = `${tax.prefix}.${doc.slug}`
      if (existingKeys.has(key)) continue

      entriesToAppend.push({
        _type: 'entry',
        key,
        value: doc.title || doc.slug,
        notes: `${tax.type} ${doc._id}`,
      })
      existingKeys.add(key)
    }
  }

  if (!entriesToAppend.length) {
    console.log(`Locale ${locale}: no new taxonomy keys to add.`)
    return
  }

  console.log(
    `Locale ${locale}: adding ${entriesToAppend.length} taxonomy keys to dictionary ${dictionary._id}`,
  )

  await client
    .patch(dictionary._id)
    .setIfMissing({entries: []})
    .insert('after', 'entries[-1]', entriesToAppend)
    .commit()
}

async function main() {
  console.log('Starting taxonomy → dictionary sync')
  console.log('Locales:', ACTIVE_LOCALES.join(', '))

  for (const locale of ACTIVE_LOCALES) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await syncLocale(locale)
    } catch (err) {
      console.error(`Failed to sync locale ${locale}:`, err)
    }
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
