// Create LV sibling DRAFTS for any EN trustedBy doc that is referenced by the LV
// landing but has no LV counterpart yet.
//
// Strategy:
//   - Look at unresolved entries from fixLandingTrustedByLocales.js (any EN
//     trustedBy referenced by an LV landing whose name has no LV sibling).
//   - For each, create a NEW trustedBy doc with:
//       _id: drafts.<freshUuid>           (so editor reviews before publish)
//       locale: 'lv'
//       translationKey: same as EN sibling (links the pair)
//       name, slug, logo, order: cloned from EN
//       portfolioWork: resolved to LV portfolio via translationKey, else omitted
//   - Does NOT touch the landing array. After publishing the new drafts in
//     Studio, re-run fixLandingTrustedByLocales.js to swap the refs.
//
// Usage (from dezain-sanity/):
//   DRY_RUN=1 SANITY_PROJECT_ID=... SANITY_DATASET=production SANITY_TOKEN=... \
//     node scripts/seedMissingLvTrustedBys.js
//
// Drop DRY_RUN=1 to actually create the drafts.

import {createClient} from '@sanity/client'
import crypto from 'node:crypto'

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_TOKEN
const TARGET_LOCALE = process.env.TARGET_LOCALE || 'lv'

if (!projectId || !dataset || !token) {
  console.error('Missing SANITY_PROJECT_ID, SANITY_DATASET, or SANITY_TOKEN environment variables')
  process.exit(1)
}

const DRY_RUN =
  String(process.env.DRY_RUN || '') === '1' ||
  String(process.env.DRY_RUN || '').toLowerCase() === 'true'

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-05-01',
  token,
  useCdn: false,
})

function stripDraft(id) {
  return String(id || '').replace(/^drafts\./, '')
}

function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
}

async function fetchLandings() {
  return client.fetch(
    `*[_type == "landing"]{
      _id,
      locale,
      trustedBy[]{
        _key,
        _ref,
        "refLocale": @->locale,
        "refName": @->name
      }
    }`,
  )
}

async function fetchAllTrustedBys() {
  return client.fetch(
    `*[_type == "trustedBy"]{
      _id,
      locale,
      name,
      translationKey,
      slug,
      logo,
      order,
      "portfolioRef": portfolioWork._ref
    }`,
  )
}

async function fetchPortfolioSiblingId(translationKey, locale) {
  if (!translationKey || !locale) return null
  return client.fetch(
    `*[_type == "portfolio" && locale == $locale && translationKey == $translationKey][0]._id`,
    {translationKey, locale},
  )
}

function findUnresolvedRefs(landings, trustedBys, targetLocale) {
  // Index trustedBys by (locale, normalizedName) — prefer published over draft.
  const byLocale = new Map()
  for (const tb of trustedBys) {
    if (!tb.locale || !tb.name) continue
    const key = normalizeName(tb.name)
    if (!byLocale.has(tb.locale)) byLocale.set(tb.locale, new Map())
    const inner = byLocale.get(tb.locale)
    const isDraft = String(tb._id).startsWith('drafts.')
    const existing = inner.get(key)
    if (!existing || (existing.isDraft && !isDraft)) {
      inner.set(key, {id: stripDraft(tb._id), isDraft})
    }
  }

  // Index trustedBys by base id for source lookup.
  const byId = new Map()
  for (const tb of trustedBys) {
    const base = stripDraft(tb._id)
    const isDraft = String(tb._id).startsWith('drafts.')
    const existing = byId.get(base)
    if (!existing || (existing._isDraft && !isDraft)) {
      byId.set(base, {...tb, _isDraft: isDraft})
    }
  }

  const seenBaseLanding = new Set()
  const unresolved = new Map() // key: source baseId; value: {sourceDoc, landingRefs[]}

  for (const landing of landings) {
    const baseLanding = stripDraft(landing._id)
    if (seenBaseLanding.has(baseLanding)) continue
    seenBaseLanding.add(baseLanding)
    if (landing.locale !== targetLocale) continue

    const entries = Array.isArray(landing.trustedBy) ? landing.trustedBy : []
    for (const entry of entries) {
      if (!entry?._ref) continue
      if (entry.refLocale === targetLocale) continue
      const sibling = byLocale.get(targetLocale)?.get(normalizeName(entry.refName))
      if (sibling) continue
      const sourceBase = stripDraft(entry._ref)
      const sourceDoc = byId.get(sourceBase)
      if (!sourceDoc) continue
      if (!unresolved.has(sourceBase)) {
        unresolved.set(sourceBase, {sourceDoc, landingRefs: []})
      }
      unresolved.get(sourceBase).landingRefs.push({
        landingId: baseLanding,
        landingLocale: landing.locale,
        key: entry._key,
      })
    }
  }

  return [...unresolved.values()]
}

async function createLvSiblingDraft(sourceDoc, targetLocale) {
  const freshId = `drafts.${crypto.randomUUID()}`
  const translationKey = sourceDoc.translationKey || crypto.randomUUID()

  let portfolioRef = null
  if (sourceDoc.portfolioRef) {
    const sourcePortfolio = await client.fetch(
      `*[_id == $id][0]{translationKey, locale}`,
      {id: sourceDoc.portfolioRef},
    )
    if (sourcePortfolio?.translationKey) {
      const lvPortfolioId = await fetchPortfolioSiblingId(
        sourcePortfolio.translationKey,
        targetLocale,
      )
      if (lvPortfolioId) {
        portfolioRef = {_type: 'reference', _ref: lvPortfolioId}
      }
    }
  }

  const newDoc = {
    _id: freshId,
    _type: 'trustedBy',
    locale: targetLocale,
    translationKey,
    sourceDocId: stripDraft(sourceDoc._id),
    name: sourceDoc.name,
    slug: sourceDoc.slug,
    logo: sourceDoc.logo,
    ...(typeof sourceDoc.order === 'number' ? {order: sourceDoc.order} : {}),
    ...(portfolioRef ? {portfolioWork: portfolioRef} : {}),
  }

  // If source has no translationKey yet, backfill it on the source so the pair is linked.
  const needsSourceKeyPatch = !sourceDoc.translationKey

  if (DRY_RUN) {
    console.log(
      `   DRY_RUN: would create ${freshId} (translationKey=${translationKey}, portfolio=${portfolioRef?._ref || '(none)'})`,
    )
    if (needsSourceKeyPatch) {
      console.log(
        `   DRY_RUN: would patch source ${stripDraft(sourceDoc._id)} translationKey=${translationKey}`,
      )
    }
    return {createdId: stripDraft(freshId), portfolioRef: portfolioRef?._ref || null}
  }

  await client.create(newDoc)
  console.log(`   ✓ Created draft ${freshId}`)
  if (needsSourceKeyPatch) {
    try {
      await client
        .patch(stripDraft(sourceDoc._id))
        .setIfMissing({translationKey})
        .commit()
      console.log(
        `   ✓ Backfilled translationKey on source ${stripDraft(sourceDoc._id)}`,
      )
    } catch (e) {
      console.warn(`   ! Failed to backfill source translationKey:`, e.message || e)
    }
  }
  return {createdId: stripDraft(freshId), portfolioRef: portfolioRef?._ref || null}
}

async function main() {
  console.log(
    `Seeding ${TARGET_LOCALE.toUpperCase()} sibling drafts for unmapped trustedBy refs (DRY_RUN=${DRY_RUN ? 'true' : 'false'})`,
  )
  console.log('')

  const [landings, trustedBys] = await Promise.all([fetchLandings(), fetchAllTrustedBys()])
  const unresolved = findUnresolvedRefs(landings, trustedBys, TARGET_LOCALE)

  if (unresolved.length === 0) {
    console.log('Nothing to seed — every wrong-locale ref already has a sibling.')
    return
  }

  console.log(`Found ${unresolved.length} source doc(s) needing a ${TARGET_LOCALE.toUpperCase()} sibling:`)
  for (const u of unresolved) {
    console.log(
      ` - "${u.sourceDoc.name}" (source ${stripDraft(u.sourceDoc._id)}, locale=${u.sourceDoc.locale})`,
    )
    for (const r of u.landingRefs) {
      console.log(`     used in landing=${r.landingId} key=${r.key}`)
    }
  }
  console.log('')

  const created = []
  for (const u of unresolved) {
    console.log(`Seeding sibling for "${u.sourceDoc.name}":`)
    const result = await createLvSiblingDraft(u.sourceDoc, TARGET_LOCALE)
    created.push({name: u.sourceDoc.name, ...result})
    console.log('')
  }

  console.log('---')
  console.log(JSON.stringify({created, dryRun: DRY_RUN}, null, 2))
  console.log('')
  console.log('Next steps:')
  console.log('  1. Open Studio, review the new LV drafts (logo/name/portfolio look right)')
  console.log('  2. Publish them')
  console.log('  3. Re-run scripts/fixLandingTrustedByLocales.js to swap landing-lv refs')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
