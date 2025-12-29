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

const DRY_RUN =
  String(process.env.DRY_RUN || '') === '1' ||
  String(process.env.DRY_RUN || '').toLowerCase() === 'true'

async function fetchTrustedByDocs() {
  return client.fetch(
    `*[_type == "trustedBy" && defined(portfolioWork)]{
      _id,
      locale,
      "portfolioRef": portfolioWork._ref,
      "portfolio": portfolioWork->{
        _id,
        locale,
        translationKey,
        "slug": slug.current
      }
    } | order(locale asc, _id asc)`,
  )
}

async function fetchPortfolioSiblingId(translationKey, locale) {
  if (!translationKey || !locale) return null

  const sibling = await client.fetch(
    `*[_type == "portfolio" && locale == $locale && translationKey == $translationKey][0]{
      _id,
      "slug": slug.current
    }`,
    {translationKey, locale},
  )

  return sibling?._id || null
}

async function patchPortfolioWorkRef(id, nextPortfolioId) {
  if (!id || !nextPortfolioId) return

  const baseId = String(id).replace(/^drafts\./, '')
  const nextRef = {_type: 'reference', _ref: nextPortfolioId}

  if (DRY_RUN) {
    console.log(`  · DRY_RUN: would patch ${baseId} portfolioWork -> ${nextPortfolioId}`)
    return
  }

  try {
    await client.patch(baseId).set({portfolioWork: nextRef}).commit()
    console.log(`  ✓ Patched published doc ${baseId} portfolioWork -> ${nextPortfolioId}`)
  } catch (e) {
    console.warn(`  ! Failed to patch published doc ${baseId}:`, e.message || e)
  }

  try {
    await client.patch(`drafts.${baseId}`).set({portfolioWork: nextRef}).commit()
    console.log(`  ✓ Patched draft doc drafts.${baseId} portfolioWork -> ${nextPortfolioId}`)
  } catch (e) {
    if (e?.statusCode !== 404) {
      console.warn(`  ! Failed to patch draft doc drafts.${baseId}:`, e.message || e)
    }
  }
}

async function main() {
  console.log('Syncing trustedBy.portfolioWork references to match trustedBy.locale...')
  console.log(`DRY_RUN=${DRY_RUN ? 'true' : 'false'}`)

  const trustedByDocs = await fetchTrustedByDocs()
  console.log(`Fetched ${trustedByDocs.length} trustedBy docs with portfolioWork`)

  let checked = 0
  let fixed = 0
  let skippedNoPortfolio = 0
  let skippedNoTranslationKey = 0
  let skippedAlreadyOk = 0
  let skippedNoSibling = 0

  for (const doc of trustedByDocs) {
    checked += 1

    const docLocale = doc?.locale
    const portfolio = doc?.portfolio

    if (!portfolio?._id) {
      skippedNoPortfolio += 1
      console.warn(`\n! Missing portfolio deref for trustedBy=${doc?._id}`)
      continue
    }

    if (portfolio.locale === docLocale) {
      skippedAlreadyOk += 1
      continue
    }

    const translationKey = portfolio.translationKey
    if (!translationKey) {
      skippedNoTranslationKey += 1
      console.warn(
        `\n! Missing translationKey on portfolio=${portfolio._id} (trustedBy=${doc._id}); cannot resolve sibling`,
      )
      continue
    }

    const siblingId = await fetchPortfolioSiblingId(translationKey, docLocale)

    if (!siblingId) {
      skippedNoSibling += 1
      console.warn(
        `\n! No sibling portfolio found for translationKey=${translationKey} locale=${docLocale} (trustedBy=${doc._id})`,
      )
      continue
    }

    if (doc?.portfolioRef === siblingId) {
      skippedAlreadyOk += 1
      continue
    }

    console.log(
      `\nFixing trustedBy=${doc._id} (${docLocale}): portfolio ${portfolio._id} (${portfolio.locale}) -> ${siblingId} (${docLocale})`,
    )

    await patchPortfolioWorkRef(doc._id, siblingId)
    fixed += 1
  }

  console.log('\nDone.')
  console.log(
    JSON.stringify(
      {
        checked,
        fixed,
        skippedNoPortfolio,
        skippedNoTranslationKey,
        skippedNoSibling,
        skippedAlreadyOk,
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
