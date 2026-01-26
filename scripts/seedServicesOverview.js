// Seed Services Overview page content from the design renders.
//
// Usage (from dezain-sanity/):
//   SANITY_PROJECT_ID=... SANITY_DATASET=v2 SANITY_TOKEN=... node scripts/seedServicesOverview.js
//
// The script creates or updates the servicesOverview document for each locale.
// It will NOT overwrite existing documents - it only creates if missing.

import {createClient} from '@sanity/client'
import crypto from 'crypto'

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'v2'
const token = process.env.SANITY_TOKEN

if (!projectId || !token) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_TOKEN environment variables')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-05-01',
  token,
  useCdn: false,
})

// Locales to seed
const LOCALES_TO_SEED = (process.env.SANITY_ACTIVE_LOCALES || 'en')
  .split(',')
  .map((l) => l.trim())
  .filter(Boolean)

// Services Overview content extracted from design renders
const SERVICES_OVERVIEW_CONTENT = {
  header: {
    eyebrow: 'From idea to reality.',
    title: 'Design & AI solutions that move brands forward.',
    subtitle:
      'From brand identity to digital strategy and AI automation—get the services that grow your business fast and smart.',
    primaryCta: {
      text: 'Start now',
      link: '/contact',
      withArrow: true,
    },
    secondaryCta: {
      text: 'Book a call',
      link: '/contact',
      withArrow: false,
    },
  },
  sellingPoints: {
    header: {
      smallTitle: null,
      title: 'Built for Speed. Designed for Clarity. Powered by Intelligence.',
      subtitle:
        'From the first sketch to final launch, we work like your in-house creative team—fast, sharp, and committed to results. Dezain Studio gives you not just deliverables, but direction.',
    },
    cards: [
      {
        _type: 'iconCard',
        _key: 'sp1',
        title: null,
        description: 'Every brand move is intentional, clear, human, and unmistakably yours.',
      },
      {
        _type: 'iconCard',
        _key: 'sp2',
        title: null,
        description: 'AI speeds the tools, but every visible detail is crafted by human hands.',
      },
      {
        _type: 'iconCard',
        _key: 'sp3',
        title: null,
        description:
          'What we design reflects you. Every detail matters. Nothing is left to chance.',
      },
    ],
  },
  testimonialsHeader: {
    smallTitle: 'Testimonials',
    title: 'Beyond expectations',
    subtitle:
      'Founders deserve partners who listen, guide, and turn vision into brands that feel true, bold, and ready to grow.',
  },
  process: {
    header: {
      smallTitle: 'Process',
      title: 'Five steps. One promise.',
      subtitle:
        'We move ideas from insight to launch with a proven, focused process designed for clarity and speed.',
    },
    steps: [
      {
        _type: 'iconCard',
        _key: 'step1',
        title: '1. Discover',
        description:
          'We listen, audit and gather insight from industry data, users and your internal teams.',
      },
      {
        _type: 'iconCard',
        _key: 'step2',
        title: '2. Define',
        description:
          'Workshops turn raw insight into a sharp strategy: purpose, position, personality.',
      },
      {
        _type: 'iconCard',
        _key: 'step3',
        title: '3. Design',
        description:
          'Rapid co-creation sprints craft logos, interfaces, packs or campaigns with live client input.',
      },
      {
        _type: 'iconCard',
        _key: 'step4',
        title: '4. Validate',
        description:
          'We test concepts with real users, refine based on feedback, and prepare for launch.',
      },
      {
        _type: 'iconCard',
        _key: 'step5',
        title: '5. Deliver',
        description:
          'Final assets, guidelines, and handoff—everything you need to launch and scale with confidence.',
      },
    ],
  },
  deliverablesSection: {
    smallTitle: 'All Services',
    title: 'The possibilities are literally endless',
  },
}

async function findExistingServicesOverview(locale) {
  const doc = await client.fetch('*[_type == "servicesOverview" && locale == $locale][0]', {locale})
  return doc
}

async function seedServicesOverviewForLocale(locale) {
  const existing = await findExistingServicesOverview(locale)

  if (existing) {
    console.log(`Locale ${locale}: deleting existing servicesOverview (_id: ${existing._id})`)
    await client.delete(existing._id)
    // Also delete draft if exists
    if (!existing._id.startsWith('drafts.')) {
      await client.delete(`drafts.${existing._id}`).catch(() => {})
    }
  }

  const translationKey = existing?.translationKey || crypto.randomUUID()
  const docId = `servicesOverview-${locale}`

  const doc = {
    _id: docId,
    _type: 'servicesOverview',
    locale,
    translationKey,
    header: SERVICES_OVERVIEW_CONTENT.header,
    sellingPoints: SERVICES_OVERVIEW_CONTENT.sellingPoints,
    testimonialsHeader: SERVICES_OVERVIEW_CONTENT.testimonialsHeader,
    process: SERVICES_OVERVIEW_CONTENT.process,
    deliverablesSection: SERVICES_OVERVIEW_CONTENT.deliverablesSection,
  }

  console.log(`Locale ${locale}: creating servicesOverview document (_id: ${docId})`)

  await client.createOrReplace(doc)
  console.log(`Locale ${locale}: created successfully.`)
}

async function main() {
  console.log('=== Seeding Services Overview ===')
  console.log('Project:', projectId)
  console.log('Dataset:', dataset)
  console.log('Locales:', LOCALES_TO_SEED.join(', '))
  console.log('')

  for (const locale of LOCALES_TO_SEED) {
    try {
      await seedServicesOverviewForLocale(locale)
    } catch (err) {
      console.error(`Failed to seed locale ${locale}:`, err)
    }
  }

  console.log('')
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
