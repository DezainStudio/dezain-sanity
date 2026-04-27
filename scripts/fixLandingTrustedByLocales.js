// Fix landing.trustedBy[] refs whose target locale doesn't match the landing locale.
//
// For each landing doc:
//   - Walk every entry in trustedBy[]
//   - If the referenced trustedBy doc's locale != landing.locale,
//     try to find a same-name sibling trustedBy whose locale == landing.locale
//   - Replace the ref with the sibling's _id (preserving the array _key)
//   - Skip entries where no sibling exists; report them so a human can create one
//
// Patches both published and draft versions of each landing.
//
// Usage (from dezain-sanity/):
//   SANITY_PROJECT_ID=... SANITY_DATASET=production SANITY_TOKEN=... \
//     node scripts/fixLandingTrustedByLocales.js
//
// Dry run (no writes):
//   DRY_RUN=1 node scripts/fixLandingTrustedByLocales.js

import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_TOKEN

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

async function fetchAllTrustedBys() {
  return client.fetch(
    `*[_type == "trustedBy"]{
      _id,
      locale,
      name
    }`,
  )
}

async function fetchAllLandings() {
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

function buildSiblingIndex(trustedBys) {
  // Map<locale, Map<normalizedName, baseId>>
  // Prefer published over draft; if both exist for the same (locale, name), keep the published one.
  const byLocale = new Map()
  for (const tb of trustedBys) {
    const locale = tb.locale
    if (!locale) continue
    const key = normalizeName(tb.name)
    if (!key) continue
    if (!byLocale.has(locale)) byLocale.set(locale, new Map())
    const inner = byLocale.get(locale)
    const baseId = stripDraft(tb._id)
    const isDraft = String(tb._id).startsWith('drafts.')
    const existing = inner.get(key)
    if (!existing) {
      inner.set(key, {id: baseId, isDraft})
    } else if (existing.isDraft && !isDraft) {
      inner.set(key, {id: baseId, isDraft})
    }
  }
  return byLocale
}

async function patchLandingArray(landingId, replacements) {
  // replacements: Array<{key: string, nextRef: string}>
  if (replacements.length === 0) return

  const baseId = stripDraft(landingId)
  const targets = [baseId, `drafts.${baseId}`]

  for (const target of targets) {
    if (DRY_RUN) {
      for (const r of replacements) {
        console.log(
          `      DRY_RUN: would patch ${target}.trustedBy[_key=="${r.key}"]._ref -> ${r.nextRef}`,
        )
      }
      continue
    }

    let tx = client.patch(target)
    for (const r of replacements) {
      tx = tx.set({[`trustedBy[_key=="${r.key}"]._ref`]: r.nextRef})
    }
    try {
      await tx.commit()
      console.log(`      ✓ Patched ${target} (${replacements.length} ref${replacements.length === 1 ? '' : 's'})`)
    } catch (e) {
      if (e?.statusCode === 404) {
        // No draft (or no published) — that's fine
      } else {
        console.warn(`      ! Failed to patch ${target}:`, e.message || e)
      }
    }
  }
}

async function main() {
  console.log(`Fixing landing.trustedBy[] locale mismatches (DRY_RUN=${DRY_RUN ? 'true' : 'false'})`)
  console.log('')

  const [trustedBys, landings] = await Promise.all([fetchAllTrustedBys(), fetchAllLandings()])

  const siblingIndex = buildSiblingIndex(trustedBys)

  let totalChecked = 0
  let totalFixed = 0
  let totalSkippedNoSibling = 0
  let totalSkippedAlreadyOk = 0
  let totalSkippedMissingMeta = 0
  const unresolved = []

  // Group by base landing id so published+draft of the same landing are patched once.
  const seenBase = new Set()

  for (const landing of landings) {
    const baseId = stripDraft(landing._id)
    if (seenBase.has(baseId)) continue
    seenBase.add(baseId)

    const landingLocale = landing.locale
    const entries = Array.isArray(landing.trustedBy) ? landing.trustedBy : []

    console.log(`landing=${baseId} locale=${landingLocale || '(missing)'}`)

    if (!landingLocale) {
      console.log('  ! landing has no locale; skipping')
      console.log('')
      continue
    }

    const replacements = []

    for (const entry of entries) {
      totalChecked += 1

      if (!entry?._ref || !entry?._key) {
        totalSkippedMissingMeta += 1
        console.log(`  ! entry missing _ref or _key: ${JSON.stringify(entry)}`)
        continue
      }

      const refLocale = entry.refLocale
      const refName = entry.refName

      if (refLocale === landingLocale) {
        totalSkippedAlreadyOk += 1
        continue
      }

      const sibling = siblingIndex.get(landingLocale)?.get(normalizeName(refName))
      if (!sibling) {
        totalSkippedNoSibling += 1
        console.log(
          `  ⚠️  no ${landingLocale} sibling for "${refName}" (current ref ${entry._ref} locale=${refLocale || '(unresolved)'})`,
        )
        unresolved.push({
          landingId: baseId,
          landingLocale,
          key: entry._key,
          currentRef: entry._ref,
          currentLocale: refLocale,
          name: refName,
        })
        continue
      }

      console.log(
        `  → "${refName}": ${entry._ref} (${refLocale}) → ${sibling.id} (${landingLocale})`,
      )
      replacements.push({key: entry._key, nextRef: sibling.id})
    }

    if (replacements.length > 0) {
      await patchLandingArray(baseId, replacements)
      totalFixed += replacements.length
    }

    console.log('')
  }

  console.log('---')
  console.log(
    JSON.stringify(
      {
        checked: totalChecked,
        fixed: totalFixed,
        skippedAlreadyOk: totalSkippedAlreadyOk,
        skippedNoSibling: totalSkippedNoSibling,
        skippedMissingMeta: totalSkippedMissingMeta,
        dryRun: DRY_RUN,
      },
      null,
      2,
    ),
  )

  if (unresolved.length > 0) {
    console.log('')
    console.log('Entries that need a manually-created sibling trustedBy doc:')
    console.log(JSON.stringify(unresolved, null, 2))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
