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

const LOCALES = ['en', 'lv']

const INCLUDE_EXISTING_TRUSTED_BY_GROUPS =
  String(process.env.INCLUDE_EXISTING_TRUSTED_BY_GROUPS || '') === '1' ||
  String(process.env.INCLUDE_EXISTING_TRUSTED_BY_GROUPS || '').toLowerCase() === 'true'

const PRINT_MISSING_GROUPS_LIMIT = Number(process.env.PRINT_MISSING_GROUPS_LIMIT || 50)

const DRY_RUN =
  String(process.env.DRY_RUN || '') === '1' ||
  String(process.env.DRY_RUN || '').toLowerCase() === 'true'

function genKey() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now()}-${Math.random()}`
}

function toRef(id, key) {
  return {_type: 'reference', _ref: id, _key: key || genKey()}
}

async function fetchLanding(locale) {
  return client.fetch(
    `*[_type == "landing" && locale == $locale] | order(_updatedAt desc)[0]{
      _id,
      locale,
      translationKey,
      trustedBy[]{_key, _ref},
      "trustedByDocs": trustedBy[]->{
        _id,
        locale,
        translationKey,
        name,
        slug,
        logo,
        order,
        "portfolioRef": portfolioWork._ref,
        portfolioWork->{
          _id,
          locale,
          translationKey,
          "slug": slug.current,
          title
        }
      }
    }`,
    {locale},
  )
}

async function fetchPortfolios() {
  return client.fetch(
    `*[_type == "portfolio" && locale in $locales]{
      _id,
      locale,
      translationKey,
      "slug": slug.current,
      title
    } | order(locale asc, slug asc)`,
    {locales: LOCALES},
  )
}

async function fetchTrustedByDocs() {
  return client.fetch(
    `*[_type == "trustedBy" && locale in $locales && defined(portfolioWork)]{
      _id,
      locale,
      translationKey,
      name,
      slug,
      logo,
      order,
      "portfolioRef": portfolioWork._ref,
      portfolioWork->{
        _id,
        locale,
        translationKey,
        "slug": slug.current,
        title
      }
    } | order(locale asc, _id asc)`,
    {locales: LOCALES},
  )
}

async function patchDocBothStates(id, patch) {
  const baseId = String(id).replace(/^drafts\./, '')

  if (DRY_RUN) {
    console.log(`  · DRY_RUN: would patch ${baseId} with`, JSON.stringify(patch))
    return
  }

  try {
    await client.patch(baseId).set(patch).commit()
    console.log(`  ✓ Patched published ${baseId}`)
  } catch (e) {
    console.warn(`  ! Failed to patch published ${baseId}:`, e.message || e)
  }

  try {
    await client.patch(`drafts.${baseId}`).set(patch).commit()
    console.log(`  ✓ Patched draft drafts.${baseId}`)
  } catch (e) {
    if (e?.statusCode !== 404) {
      console.warn(`  ! Failed to patch draft drafts.${baseId}:`, e.message || e)
    }
  }
}

async function ensureUniqueTrustedBySlug(locale, desired) {
  const base = (desired || '').trim()
  if (!base) return `${locale}-${genKey().slice(0, 8)}`

  const count = await client.fetch(
    `count(*[_type == "trustedBy" && locale == $locale && slug.current == $slug])`,
    {locale, slug: base},
  )

  if (count === 0) return base

  const candidate = `${base}-${locale}`
  const count2 = await client.fetch(
    `count(*[_type == "trustedBy" && locale == $locale && slug.current == $slug])`,
    {locale, slug: candidate},
  )

  if (count2 === 0) return candidate

  return `${candidate}-${genKey().slice(0, 8)}`
}

async function createTrustedByDoc({
  locale,
  translationKey,
  name,
  slugCurrent,
  logo,
  order,
  portfolioId,
}) {
  if (!portfolioId) {
    console.warn(`  ! Cannot create trustedBy(${locale}): missing portfolioId`)
    return null
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    console.warn(`  ! Cannot create trustedBy(${locale}): missing name (portfolio=${portfolioId})`)
    return null
  }
  if (!logo) {
    console.warn(`  ! Cannot create trustedBy(${locale}): missing logo (portfolio=${portfolioId})`)
    return null
  }

  const uniqueSlug = await ensureUniqueTrustedBySlug(locale, slugCurrent)

  const doc = {
    _type: 'trustedBy',
    locale,
    translationKey,
    name,
    slug: {current: uniqueSlug},
    logo,
    order,
    portfolioWork: {_type: 'reference', _ref: portfolioId},
  }

  if (DRY_RUN) {
    const fakeId = `dryrun.trustedBy.${locale}.${String(portfolioId).replace(/[^a-zA-Z0-9_.-]/g, '_')}`
    console.log(
      `  · DRY_RUN: would create trustedBy(${locale}) ${fakeId} for portfolio=${portfolioId}`,
    )
    return {
      _id: fakeId,
      locale,
      translationKey,
      name,
      slug: {current: uniqueSlug},
      logo,
      order,
      portfolioRef: portfolioId,
    }
  }

  const created = await client.create(doc)
  console.log(`  ✓ Created trustedBy ${created._id} (${locale})`)
  return created
}

function buildPortfolioMap(portfolios) {
  const map = new Map()
  let missingTranslationKey = 0

  for (const p of portfolios) {
    const tk = p?.translationKey
    if (!tk) {
      missingTranslationKey += 1
      continue
    }

    if (!map.has(tk)) map.set(tk, {})
    map.get(tk)[p.locale] = p
  }

  return {map, missingTranslationKey}
}

function buildTrustedByByPortfolioTk(trustedByDocs) {
  const map = new Map()
  let missingPortfolioTranslationKey = 0
  const duplicates = []

  for (const doc of trustedByDocs) {
    const portfolioTk = doc?.portfolioWork?.translationKey
    if (!portfolioTk) {
      missingPortfolioTranslationKey += 1
      continue
    }

    if (!map.has(portfolioTk)) map.set(portfolioTk, {})

    const perLocale = map.get(portfolioTk)
    const existing = perLocale[doc.locale]

    if (!existing) {
      perLocale[doc.locale] = doc
      continue
    }

    const existingIsDraft = String(existing._id).startsWith('drafts.')
    const nextIsDraft = String(doc._id).startsWith('drafts.')

    duplicates.push({portfolioTk, locale: doc.locale, ids: [existing._id, doc._id]})

    if (existingIsDraft && !nextIsDraft) {
      perLocale[doc.locale] = doc
    }
  }

  return {map, missingPortfolioTranslationKey, duplicates}
}

function extractLandingPortfolioTkOrder(landing) {
  const result = []

  const docs = Array.isArray(landing?.trustedByDocs) ? landing.trustedByDocs : []
  for (const t of docs) {
    const tk = t?.portfolioWork?.translationKey
    if (tk && !result.includes(tk)) {
      result.push(tk)
    }
  }

  return result
}

function buildCanonicalOrder(enLanding, lvLanding) {
  const enOrder = extractLandingPortfolioTkOrder(enLanding)
  const lvOrder = extractLandingPortfolioTkOrder(lvLanding)

  const seen = new Set()
  const merged = []

  for (const tk of enOrder) {
    if (seen.has(tk)) continue
    seen.add(tk)
    merged.push(tk)
  }

  for (const tk of lvOrder) {
    if (seen.has(tk)) continue
    seen.add(tk)
    merged.push(tk)
  }

  return merged
}

function extendOrderWithExistingTrustedBy(order, trustedByByPortfolioTk) {
  const seen = new Set(order)
  const extras = []

  for (const [portfolioTk, group] of trustedByByPortfolioTk.entries()) {
    if (seen.has(portfolioTk)) continue
    const baseDoc = group?.en || group?.lv
    extras.push({portfolioTk, name: baseDoc?.name || ''})
  }

  extras.sort((a, b) => String(a.name).localeCompare(String(b.name)))

  return order.concat(extras.map((e) => e.portfolioTk))
}

function reportMissingTrustedByGroups(portfolioMap, trustedByByPortfolioTk) {
  const missing = []

  for (const [portfolioTk, byLocale] of portfolioMap.entries()) {
    if (trustedByByPortfolioTk.has(portfolioTk)) continue
    const en = byLocale?.en
    const lv = byLocale?.lv
    missing.push({
      portfolioTk,
      enSlug: en?.slug || null,
      lvSlug: lv?.slug || null,
      enId: en?._id || null,
      lvId: lv?._id || null,
    })
  }

  if (!missing.length) {
    console.log('All portfolio translation groups have at least one trustedBy doc.')
    return
  }

  console.warn(`! Missing trustedBy groups for ${missing.length} portfolio translation groups.`)

  const limit = Number.isFinite(PRINT_MISSING_GROUPS_LIMIT) ? PRINT_MISSING_GROUPS_LIMIT : 50
  const slice = missing.slice(0, Math.max(0, limit))
  if (slice.length) {
    console.warn('  First missing groups (portfolio translationKey + slugs):')
    for (const item of slice) {
      console.warn(`  - ${item.portfolioTk}  en=${item.enSlug || '—'}  lv=${item.lvSlug || '—'}`)
    }
  }

  if (missing.length > slice.length) {
    console.warn(
      `  (Showing ${slice.length}/${missing.length}. Increase PRINT_MISSING_GROUPS_LIMIT to see more.)`,
    )
  }
}

async function main() {
  console.log('Syncing landing.trustedBy across locales...')
  console.log(`DRY_RUN=${DRY_RUN ? 'true' : 'false'}`)

  const [enLanding, lvLanding, portfolios, trustedByDocs] = await Promise.all([
    fetchLanding('en'),
    fetchLanding('lv'),
    fetchPortfolios(),
    fetchTrustedByDocs(),
  ])

  if (!enLanding?._id || !lvLanding?._id) {
    console.error('Missing landing documents for en and/or lv. Aborting.')
    process.exit(1)
  }

  const {map: portfolioMap, missingTranslationKey: missingPortfolioTranslationKey} =
    buildPortfolioMap(portfolios)

  const {
    map: trustedByByPortfolioTk,
    missingPortfolioTranslationKey: missingTrustedByPortfolioTk,
    duplicates: trustedByDuplicates,
  } = buildTrustedByByPortfolioTk(trustedByDocs)

  if (missingPortfolioTranslationKey) {
    console.warn(`! ${missingPortfolioTranslationKey} portfolio docs are missing translationKey`)
  }
  if (missingTrustedByPortfolioTk) {
    console.warn(
      `! ${missingTrustedByPortfolioTk} trustedBy docs reference a portfolio missing translationKey (cannot group)`,
    )
  }

  if (trustedByDuplicates?.length) {
    console.warn(
      `! Found ${trustedByDuplicates.length} duplicate trustedBy docs for the same portfolio group+locale (keeping one).`,
    )

    for (const d of trustedByDuplicates.slice(0, 20)) {
      console.warn(`  - portfolioTk=${d.portfolioTk} locale=${d.locale} ids=${d.ids.join(', ')}`)
    }
    if (trustedByDuplicates.length > 20) {
      console.warn(`  (Showing 20/${trustedByDuplicates.length} duplicates)`)
    }
  }

  reportMissingTrustedByGroups(portfolioMap, trustedByByPortfolioTk)

  const canonicalPortfolioOrder = INCLUDE_EXISTING_TRUSTED_BY_GROUPS
    ? extendOrderWithExistingTrustedBy(
        buildCanonicalOrder(enLanding, lvLanding),
        trustedByByPortfolioTk,
      )
    : buildCanonicalOrder(enLanding, lvLanding)

  console.log(
    `Found ${canonicalPortfolioOrder.length} trustedBy portfolio groups (from both landings)`,
  )

  let created = 0
  let patchedTrustedBy = 0
  let patchedLanding = 0
  let skippedMissingPortfolioSibling = 0

  for (const portfolioTk of canonicalPortfolioOrder) {
    const portfoliosByLocale = portfolioMap.get(portfolioTk)
    if (!portfoliosByLocale) {
      console.warn(`! No portfolios found for translationKey=${portfolioTk}`)
      skippedMissingPortfolioSibling += 1
      continue
    }

    const groupDocs = trustedByByPortfolioTk.get(portfolioTk) || {}

    const baseDoc = groupDocs.en || groupDocs.lv

    if (!baseDoc) {
      console.warn(
        `! No trustedBy doc found for portfolio translationKey=${portfolioTk}. Skipping.`,
      )
      continue
    }

    const groupTranslationKey = baseDoc.translationKey || genKey()

    for (const locale of LOCALES) {
      const expectedPortfolio = portfoliosByLocale[locale]
      if (!expectedPortfolio?._id) {
        console.warn(
          `! Missing portfolio sibling for portfolio translationKey=${portfolioTk} locale=${locale}. Skipping locale.`,
        )
        skippedMissingPortfolioSibling += 1
        continue
      }

      let doc = groupDocs[locale]

      if (!doc) {
        const createdDoc = await createTrustedByDoc({
          locale,
          translationKey: groupTranslationKey,
          name: baseDoc.name,
          slugCurrent: baseDoc?.slug?.current,
          logo: baseDoc.logo,
          order: baseDoc.order,
          portfolioId: expectedPortfolio._id,
        })

        if (createdDoc) {
          created += 1
          trustedByDocs.push(createdDoc)
          if (!trustedByByPortfolioTk.has(portfolioTk)) trustedByByPortfolioTk.set(portfolioTk, {})
          trustedByByPortfolioTk.get(portfolioTk)[locale] = createdDoc
          doc = createdDoc
        }
      } else {
        const nextPatch = {}

        if (doc.translationKey !== groupTranslationKey) {
          nextPatch.translationKey = groupTranslationKey
        }

        if (doc?.portfolioRef !== expectedPortfolio._id) {
          nextPatch.portfolioWork = {_type: 'reference', _ref: expectedPortfolio._id}
        }

        if (Object.keys(nextPatch).length) {
          console.log(
            `Updating trustedBy=${doc._id} (${locale}) for portfolioTk=${portfolioTk}: ${JSON.stringify(
              nextPatch,
            )}`,
          )
          await patchDocBothStates(doc._id, nextPatch)
          patchedTrustedBy += 1
        }
      }
    }
  }

  for (const landing of [enLanding, lvLanding]) {
    const locale = landing.locale
    const refs = []

    for (const portfolioTk of canonicalPortfolioOrder) {
      const groupDocs = trustedByByPortfolioTk.get(portfolioTk) || {}
      const doc = groupDocs[locale]

      if (!doc?._id) continue

      refs.push(toRef(String(doc._id).replace(/^drafts\./, ''), portfolioTk))
    }

    console.log(
      `\nLanding ${landing._id} (${locale}): setting trustedBy refs to ${refs.length} items (canonical order)`,
    )

    await patchDocBothStates(landing._id, {trustedBy: refs})
    patchedLanding += 1
  }

  console.log('\nDone.')
  console.log(
    JSON.stringify(
      {
        created,
        patchedTrustedBy,
        patchedLanding,
        skippedMissingPortfolioSibling,
      },
      null,
      2,
    ),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
