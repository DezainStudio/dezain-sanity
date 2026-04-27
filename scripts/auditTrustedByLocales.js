// Audit trustedBy → landing locale alignment.
//
// For every trustedBy doc, reports:
//   - its own locale
//   - the locale of the landing pages that reference it (via landing.trustedBy[]._ref)
//   - the locale of its portfolioWork target
// Flags any cross-locale mismatch.
//
// Usage (from dezain-sanity/):
//   SANITY_PROJECT_ID=... SANITY_DATASET=production SANITY_TOKEN=... node scripts/auditTrustedByLocales.js

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

function stripDraft(id) {
  return String(id || '').replace(/^drafts\./, '')
}

async function fetchTrustedByDocs() {
  return client.fetch(
    `*[_type == "trustedBy"]{
      _id,
      locale,
      name,
      "portfolioRef": portfolioWork._ref,
      "portfolioLocale": portfolioWork->locale,
      "portfolioName": portfolioWork->name
    } | order(locale asc, name asc)`,
  )
}

async function fetchLandingsWithTrustedBy() {
  return client.fetch(
    `*[_type == "landing"]{
      _id,
      locale,
      "trustedByRefs": trustedBy[]._ref
    }`,
  )
}

function buildTrustedByToLandings(landings) {
  // Map<baseTrustedById, Array<{landingId, landingLocale, isDraft}>>
  const map = new Map()
  for (const landing of landings) {
    const refs = Array.isArray(landing?.trustedByRefs) ? landing.trustedByRefs : []
    for (const ref of refs) {
      const base = stripDraft(ref)
      if (!map.has(base)) map.set(base, [])
      map.get(base).push({
        landingId: landing._id,
        landingLocale: landing.locale || '(missing)',
        isDraft: String(landing._id).startsWith('drafts.'),
      })
    }
  }
  return map
}

async function main() {
  const [trustedBys, landings] = await Promise.all([
    fetchTrustedByDocs(),
    fetchLandingsWithTrustedBy(),
  ])

  const refsByTrustedBy = buildTrustedByToLandings(landings)

  console.log(`Fetched ${trustedBys.length} trustedBy docs and ${landings.length} landing docs`)
  console.log('')

  const issues = []

  for (const tb of trustedBys) {
    const baseId = stripDraft(tb._id)
    const isDraft = String(tb._id).startsWith('drafts.')
    const landingRefs = refsByTrustedBy.get(baseId) || []
    const landingLocales = [...new Set(landingRefs.map((r) => r.landingLocale))]

    const tbLocale = tb.locale || '(missing)'
    const portfolioLocale = tb.portfolioLocale || (tb.portfolioRef ? '(unresolved)' : '(none)')

    const landingMismatch = landingLocales.some((loc) => loc !== tbLocale)
    const portfolioMismatch = tb.portfolioRef && portfolioLocale !== tbLocale

    const status = landingMismatch || portfolioMismatch ? '⚠️ ' : '   '

    console.log(
      `${status}trustedBy=${baseId}${isDraft ? ' (draft)' : ''} | locale=${tbLocale} | name="${tb.name || ''}"`,
    )
    console.log(
      `       portfolioWork: ref=${tb.portfolioRef || '(none)'} locale=${portfolioLocale} name="${tb.portfolioName || ''}"`,
    )
    if (landingRefs.length === 0) {
      console.log(`       referenced by landings: (none)`)
    } else {
      console.log(`       referenced by landings:`)
      for (const r of landingRefs) {
        const same = r.landingLocale === tbLocale ? '   ' : '!! '
        console.log(
          `         ${same}landing=${r.landingId}${r.isDraft ? ' (draft)' : ''} locale=${r.landingLocale}`,
        )
      }
    }
    console.log('')

    if (landingMismatch || portfolioMismatch) {
      issues.push({
        trustedById: tb._id,
        trustedByLocale: tbLocale,
        name: tb.name,
        landingMismatch: landingMismatch
          ? landingRefs
              .filter((r) => r.landingLocale !== tbLocale)
              .map((r) => ({landingId: r.landingId, landingLocale: r.landingLocale}))
          : null,
        portfolioMismatch: portfolioMismatch
          ? {portfolioRef: tb.portfolioRef, portfolioLocale}
          : null,
      })
    }
  }

  console.log('---')
  console.log(`Total trustedBy docs: ${trustedBys.length}`)
  console.log(`Docs with mismatches: ${issues.length}`)
  if (issues.length > 0) {
    console.log('')
    console.log('Mismatch summary:')
    console.log(JSON.stringify(issues, null, 2))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
