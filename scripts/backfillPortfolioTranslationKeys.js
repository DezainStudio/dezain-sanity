import {createClient} from '@sanity/client'
import crypto from 'crypto'

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

// Explicit EN/LV slug pairs for portfolio siblings.
// We infer the canonical translationKey at runtime from existing docs
// (prefer LV's key if present) so we don't hard-code UUIDs here.
const PAIRS = [
  {
    enSlug: 'cliptell-logotype',
    lvSlug: 'cliptell-jauns-logotips-b2b-video-marketinga-uznemuma-izaugsmei',
  },
  {
    enSlug: 'environmental-installation-for-riga-birthday-823',
    lvSlug: 'vides-instalacija-rigas-823-dzimsanas-diena',
  },
  {
    enSlug: 'ilona-tanne-brand-identity',
    lvSlug: 'ilona-tanne-veselibas-zimola-identitate-kas-vada-personisko-transformaciju',
  },
  {
    enSlug: 'made-it-podcast-by-beta-beidz',
    lvSlug: 'made-it-podkasta-identitate-dizains-kas-palidz-izcelt-neatklatus-stastus',
  },
  {
    enSlug: 'majas-cesis-website-design',
    lvSlug: 'majas-cesis-kureta-mantojuma-naktsmitnu-un-unikalu-pieredzu-kolekcija-cesis',
  },
  {
    enSlug: 'marketing-academy-website-design',
    lvSlug: 'marketinga-akademija-informacija-mainas-bet-zinasanas-paliek',
  },
  {
    enSlug: 'mikelitis-logotype',
    lvSlug: 'mikelitis-maiznicas-parveide-latvijas-mantojums-ziemelu-dizains',
  },
  {
    enSlug: 'moneo-10',
    lvSlug: 'moneo-10-godinot-desmit-gadus-biznesa-vadiba',
  },
  {
    enSlug: 'ozols-gym-brand-identity',
    lvSlug: 'ozols-premium-sporta-kluba-izveide-izmantojot-strategisku-dizainu',
  },
  {
    enSlug: 'teh-annual-report-2024-design',
    lvSlug: 'teh-gada-parskats-dizains-kas-pastiprina-zimola-mantojumu',
  },
  {
    enSlug: 'the-soldout-concept-when-ticketing-becomes-part-of-the-experience',
    lvSlug: 'soldout-koncepts-bilesu-iegade-ka-dala-no-pasakuma-pieredzes',
  },
  {
    enSlug: 'trans-europe-halles-100-event-identity',
    lvSlug: 'teh-pasakuma-identitate-digitalais-audekls-eiropas-kulturas-nakotnei',
  },
]

function genTranslationKey() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now()}-${Math.random()}`
}

async function fetchPortfolioBySlugAndLocale(slug, locale) {
  return client.fetch(
    '*[_type == "portfolio" && locale == $locale && slug.current == $slug][0]{_id, locale, "slug": slug.current, translationKey, title}',
    {slug, locale},
  )
}

async function patchTranslationKey(id, key) {
  if (!id || !key) return
  const baseId = String(id).replace(/^drafts\./, '')

  // Patch published
  try {
    await client.patch(baseId).set({translationKey: key}).commit()
    console.log(`  ✓ Patched published doc ${baseId} with translationKey=${key}`)
  } catch (e) {
    console.warn(`  ! Failed to patch published doc ${baseId}:`, e.message || e)
  }

  // Patch draft (if exists)
  try {
    await client.patch(`drafts.${baseId}`).set({translationKey: key}).commit()
    console.log(`  ✓ Patched draft doc drafts.${baseId} with translationKey=${key}`)
  } catch (e) {
    // It's fine if there is no draft; ignore 404s
    if (e?.statusCode !== 404) {
      console.warn(`  ! Failed to patch draft doc drafts.${baseId}:`, e.message || e)
    }
  }
}

async function main() {
  console.log('Backfilling portfolio translationKey values for EN/LV pairs...')

  for (const pair of PAIRS) {
    const {enSlug, lvSlug} = pair
    console.log(`\nPair: en=${enSlug}  <->  lv=${lvSlug}`)

    const [enDoc, lvDoc] = await Promise.all([
      fetchPortfolioBySlugAndLocale(enSlug, 'en'),
      fetchPortfolioBySlugAndLocale(lvSlug, 'lv'),
    ])

    if (!enDoc) {
      console.warn(`  ! EN doc not found for slug "${enSlug}"`)
      continue
    }
    if (!lvDoc) {
      console.warn(`  ! LV doc not found for slug "${lvSlug}"`)
      continue
    }

    console.log(
      `  Found EN _id=${enDoc._id}, translationKey=${enDoc.translationKey || 'null'}; LV _id=${lvDoc._id}, translationKey=${lvDoc.translationKey || 'null'}`,
    )

    // Decide canonical key: prefer LV's existing key, then EN's, then generate new
    const targetKey = lvDoc.translationKey || enDoc.translationKey || genTranslationKey()

    if (enDoc.translationKey === targetKey && lvDoc.translationKey === targetKey) {
      console.log('  → Both docs already share the same translationKey, skipping')
      continue
    }

    if (enDoc.translationKey && enDoc.translationKey !== targetKey) {
      console.log(
        `  ! EN doc has a different existing translationKey (${enDoc.translationKey}), will overwrite with ${targetKey}`,
      )
    }

    if (!lvDoc.translationKey) {
      console.log('  ! LV doc is missing translationKey, will set it as well')
    }

    // Patch both to ensure they share the same key
    await patchTranslationKey(enDoc._id, targetKey)
    await patchTranslationKey(lvDoc._id, targetKey)
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
