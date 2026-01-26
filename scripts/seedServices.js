// Seed individual Service pages content from the design renders.
//
// Usage (from dezain-sanity/):
//   SANITY_PROJECT_ID=... SANITY_DATASET=v2 SANITY_TOKEN=... node scripts/seedServices.js
//
// The script creates service documents and their related serviceType entries.
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

const LOCALES_TO_SEED = (process.env.SANITY_ACTIVE_LOCALES || 'en')
  .split(',')
  .map((l) => l.trim())
  .filter(Boolean)

// Service Types (taxonomy) - these are not localized
const SERVICE_TYPES = [
  {title: 'Brand & Identity', value: 'brand-and-identity', order: 1},
  {title: 'Web & Digital', value: 'web-and-digital', order: 2},
  {title: 'Marketing & Growth', value: 'marketing-and-growth', order: 3},
  {title: 'AI & Data', value: 'ai-and-data', order: 4},
  {title: 'Visual & Motion', value: 'visual-and-motion', order: 5},
  {title: 'Print & Packaging', value: 'print-and-packaging', order: 6},
  {title: 'Advisory & Training', value: 'advisory-and-training', order: 7},
]

// Service page content - one per service type
const SERVICES_CONTENT = {
  'brand-and-identity': {
    title: 'Design that feels inevitable',
    description:
      'Logos, names, and brand systems for trust, recognition, and clarity across digital, print, and motion.',
    header: {
      eyebrow: 'Brand & Identity',
      subtitle:
        'We translate vision into visual truth. From the first sketch to global rollout, your brand becomes instantly recognisable, unmistakably yours.',
      primaryCta: {text: 'Start now', link: '/contact', withArrow: true},
      secondaryCta: {text: 'Book a Call', link: '/contact', withArrow: false},
    },
    sellingPoints: {
      header: {
        smallTitle: null,
        title: 'Why a Strong Brand Matters',
        subtitle:
          'Your brand is your first impression, your competitive edge, and your lasting legacy. Design it right and it becomes an asset that works around the clock.',
      },
      cards: [
        {
          _type: 'iconCard',
          _key: 'bi-sp1',
          title: 'Instant Trust',
          description:
            'First impressions happen in seconds. A cohesive identity signals quality and builds trust before you even speak.',
        },
        {
          _type: 'iconCard',
          _key: 'bi-sp2',
          title: 'Clear Authority',
          description:
            'Stand apart from competitors by projecting exactly who you are—consistently across every touchpoint.',
        },
        {
          _type: 'iconCard',
          _key: 'bi-sp3',
          title: 'Long-Term ROI',
          description:
            'Great brands appreciate over time. Invest once in clear positioning and watch it pay dividends for years.',
        },
      ],
    },
    deliverables: {
      header: {
        smallTitle: 'All Services',
        title: 'The possibilities are literally endless',
        subtitle: null,
      },
      items: [
        {_key: 'bi-d1', title: 'Brand Strategy Workshops', order: 1, showInCarousel: true},
        {_key: 'bi-d2', title: 'Brand Health & Sentiment Tracking', order: 2, showInCarousel: true},
        {_key: 'bi-d3', title: 'Brand Localization Services', order: 3, showInCarousel: true},
        {_key: 'bi-d4', title: 'Cover Letters', order: 4, showInCarousel: false},
        {_key: 'bi-d5', title: 'Thumbnail & Cover Artwork', order: 5, showInCarousel: false},
        {_key: 'bi-d6', title: 'Employer Brand & Talent Program', order: 6, showInCarousel: true},
        {_key: 'bi-d7', title: 'Social Media Brand Kits', order: 7, showInCarousel: true},
        {_key: 'bi-d8', title: 'Multi-sensory Brand Experience', order: 8, showInCarousel: true},
        {_key: 'bi-d9', title: 'Event & Booth Branding', order: 9, showInCarousel: false},
        {_key: 'bi-d10', title: 'Pitch Deck Design', order: 10, showInCarousel: true},
        {
          _key: 'bi-d11',
          title: 'Sustainability & ESG Storytelling',
          order: 11,
          showInCarousel: true,
        },
      ],
    },
    process: {
      header: {
        smallTitle: 'Process',
        title: 'From Insight to Identity',
        subtitle:
          'We distil vision into a living brand system—clear, memorable, and built to endure.',
      },
      steps: [
        {
          _type: 'iconCard',
          _key: 'bi-step1',
          title: '1. Discover',
          description:
            'We listen, audit and gather insight from industry data, users and your internal teams.',
        },
        {
          _type: 'iconCard',
          _key: 'bi-step2',
          title: '2. Define',
          description:
            'Workshops turn raw insight into a sharp strategy: purpose, position, personality.',
        },
        {
          _type: 'iconCard',
          _key: 'bi-step3',
          title: '3. Design',
          description:
            'Rapid co-creation sprints craft logos, interfaces, packs or campaigns with live client input.',
        },
        {
          _type: 'iconCard',
          _key: 'bi-step4',
          title: '4. Deploy',
          description:
            'We prepare assets, guidelines, and templates so your team can launch with confidence.',
        },
        {
          _type: 'iconCard',
          _key: 'bi-step5',
          title: '5. Drive',
          description:
            'Ongoing support ensures your brand evolves with your business and stays consistent.',
        },
      ],
    },
    relatedWork: {
      mode: 'auto',
    },
  },
  'web-and-digital': {
    title: 'Experiences that feel effortless',
    description:
      'Websites, apps, and stores built for speed, UX, SEO, and conversion on all devices and platforms.',
    header: {
      eyebrow: 'Web & Digital',
      subtitle:
        'We design and develop websites, web applications, and digital products that combine form with function—crafted for conversion, built for scale.',
      primaryCta: {text: 'Start now', link: '/contact', withArrow: true},
      secondaryCta: {text: 'Book a Call', link: '/contact', withArrow: false},
    },
    sellingPoints: {
      header: {
        smallTitle: null,
        title: 'Why Digital Excellence Matters',
        subtitle:
          'In a world of infinite tabs, your digital presence must be fast, memorable, and frictionless. We build experiences that convert visitors into advocates.',
      },
      cards: [
        {
          _type: 'iconCard',
          _key: 'wd-sp1',
          title: 'Frictionless UX',
          description:
            'Reduce barriers to action with intuitive navigation, clear CTAs, and seamless flows across devices.',
        },
        {
          _type: 'iconCard',
          _key: 'wd-sp2',
          title: 'Clarity and Speed',
          description:
            'Fast load times and clean architecture drive SEO, keep users engaged, and boost conversion rates.',
        },
        {
          _type: 'iconCard',
          _key: 'wd-sp3',
          title: 'Growth Ready',
          description:
            'Scalable tech stack and flexible CMS mean your site grows with your business—no rebuild needed.',
        },
      ],
    },
    deliverables: {
      header: {
        smallTitle: 'What We Deliver',
        title: 'Choose Your Starting Point',
        subtitle: null,
      },
      items: [
        {_key: 'wd-d1', title: 'Desk / Mobile Web Design', order: 1, showInCarousel: true},
        {_key: 'wd-d2', title: 'E-commerce & Shopify', order: 2, showInCarousel: true},
        {_key: 'wd-d3', title: 'UI / UX Design', order: 3, showInCarousel: true},
        {_key: 'wd-d4', title: 'Product Discovery', order: 4, showInCarousel: true},
        {_key: 'wd-d5', title: 'App Interface Design', order: 5, showInCarousel: true},
        {_key: 'wd-d6', title: 'Design Systems', order: 6, showInCarousel: true},
        {_key: 'wd-d7', title: 'Prototyping', order: 7, showInCarousel: true},
        {_key: 'wd-d8', title: 'Usability Testing', order: 8, showInCarousel: false},
        {_key: 'wd-d9', title: 'Accessibility Audits', order: 9, showInCarousel: false},
        {_key: 'wd-d10', title: 'CMS Setup (Sanity, etc.)', order: 10, showInCarousel: true},
        {_key: 'wd-d11', title: 'SEO & Performance Optimization', order: 11, showInCarousel: true},
        {_key: 'wd-d12', title: 'Custom Web Development', order: 12, showInCarousel: true},
      ],
    },
    process: {
      header: {
        smallTitle: 'Process',
        title: 'Design, Code, Launch, Repeat',
        subtitle: 'A battle-tested flow that delivers products people love—on time and on budget.',
      },
      steps: [
        {
          _type: 'iconCard',
          _key: 'wd-step1',
          title: '1. Discover',
          description:
            'Understand your users, business goals, and technical landscape through research and audits.',
        },
        {
          _type: 'iconCard',
          _key: 'wd-step2',
          title: '2. Define',
          description:
            'Map user journeys, information architecture, and feature scope into a clear product roadmap.',
        },
        {
          _type: 'iconCard',
          _key: 'wd-step3',
          title: '3. Design',
          description:
            'High-fidelity UI, interactive prototypes, and component libraries—reviewed with your team.',
        },
        {
          _type: 'iconCard',
          _key: 'wd-step4',
          title: '4. Develop',
          description:
            'Clean, maintainable code with modern frameworks. Integrated CMS, analytics, and APIs.',
        },
        {
          _type: 'iconCard',
          _key: 'wd-step5',
          title: '5. Iterate & Grow',
          description:
            'Post-launch analytics, A/B testing, and continuous improvements to maximize ROI.',
        },
      ],
    },
    relatedWork: {
      mode: 'auto',
    },
  },
  'marketing-and-growth': {
    title: 'Campaigns that compound',
    description:
      'Campaigns, content, and funnels that grow reach, leads, and revenue with strategy.',
    header: {
      eyebrow: 'Marketing & Growth',
      subtitle:
        'From first click to loyal customer—we craft campaigns, content, and funnels that turn attention into action and action into revenue.',
      primaryCta: {text: 'Start now', link: '/contact', withArrow: true},
      secondaryCta: {text: 'Book a Call', link: '/contact', withArrow: false},
    },
    sellingPoints: {
      header: {
        smallTitle: null,
        title: 'Why Strategic Marketing Wins',
        subtitle:
          'Tactics without strategy burn budget. We align creative firepower with business goals so every campaign moves the needle.',
      },
      cards: [
        {
          _type: 'iconCard',
          _key: 'mg-sp1',
          title: 'Audience Clarity',
          description:
            "Know exactly who you're talking to—and what makes them act—before you spend a cent.",
        },
        {
          _type: 'iconCard',
          _key: 'mg-sp2',
          title: 'Channel Mastery',
          description:
            'Right message, right platform, right time. We optimize for reach and relevance.',
        },
        {
          _type: 'iconCard',
          _key: 'mg-sp3',
          title: 'Measurable Growth',
          description:
            'Every campaign comes with clear KPIs, real-time dashboards, and actionable insights.',
        },
      ],
    },
    deliverables: {
      header: {
        smallTitle: 'What We Deliver',
        title: 'Full-funnel marketing support',
        subtitle: null,
      },
      items: [
        {_key: 'mg-d1', title: 'Go-to-Market Strategy', order: 1, showInCarousel: true},
        {_key: 'mg-d2', title: 'Content Strategy & Calendars', order: 2, showInCarousel: true},
        {_key: 'mg-d3', title: 'Social Media Campaigns', order: 3, showInCarousel: true},
        {_key: 'mg-d4', title: 'Email Marketing & Automation', order: 4, showInCarousel: true},
        {
          _key: 'mg-d5',
          title: 'Paid Media (Meta, Google, LinkedIn)',
          order: 5,
          showInCarousel: true,
        },
        {_key: 'mg-d6', title: 'Landing Page Design & CRO', order: 6, showInCarousel: true},
        {_key: 'mg-d7', title: 'Video & Motion Ads', order: 7, showInCarousel: true},
        {
          _key: 'mg-d8',
          title: 'Influencer & Partnership Campaigns',
          order: 8,
          showInCarousel: false,
        },
      ],
    },
    process: {
      header: {
        smallTitle: 'Process',
        title: 'Plan, Launch, Learn, Scale',
        subtitle: 'Data-driven creativity that adapts in real-time to maximize your marketing ROI.',
      },
      steps: [
        {
          _type: 'iconCard',
          _key: 'mg-step1',
          title: '1. Audit',
          description:
            'Benchmark current performance, competitive landscape, and audience behavior.',
        },
        {
          _type: 'iconCard',
          _key: 'mg-step2',
          title: '2. Strategize',
          description:
            'Define goals, audiences, channels, and messaging frameworks for maximum impact.',
        },
        {
          _type: 'iconCard',
          _key: 'mg-step3',
          title: '3. Create',
          description:
            'Produce scroll-stopping creative—ads, videos, copy, landing pages—optimized for each channel.',
        },
        {
          _type: 'iconCard',
          _key: 'mg-step4',
          title: '4. Launch & Test',
          description: 'Deploy campaigns, run A/B tests, and gather real-world performance data.',
        },
        {
          _type: 'iconCard',
          _key: 'mg-step5',
          title: '5. Optimize',
          description:
            'Analyze results, refine targeting, and scale what works to compound your growth.',
        },
      ],
    },
    relatedWork: {
      mode: 'auto',
    },
  },
}

async function listExistingServiceTypes() {
  console.log('Fetching existing service types from taxonomies...')
  const types = await client.fetch(
    '*[_type == "serviceType"]{_id, title, "value": value.current, order}',
  )
  console.log(`  Found ${types.length} service types:`)
  for (const t of types) {
    console.log(`    - ${t.title} (${t.value})`)
  }
  return types
}

async function getServiceTypeRef(value) {
  const st = await client.fetch('*[_type == "serviceType" && value.current == $value][0]._id', {
    value,
  })
  return st ? {_type: 'reference', _ref: st} : null
}

async function seedServiceForLocale(locale, serviceTypeValue, content, order) {
  const slug = serviceTypeValue

  const existing = await client.fetch(
    '*[_type == "service" && locale == $locale && slug.current == $slug][0]',
    {locale, slug},
  )

  if (existing) {
    console.log(`  Locale ${locale}: service "${content.title}" already exists. Skipping.`)
    return
  }

  const serviceTypeRef = await getServiceTypeRef(serviceTypeValue)
  if (!serviceTypeRef) {
    console.error(`  Could not find serviceType for "${serviceTypeValue}". Skipping.`)
    return
  }

  const translationKey = crypto.randomUUID()
  const docId = `service-${serviceTypeValue}-${locale}`

  const doc = {
    _id: docId,
    _type: 'service',
    locale,
    translationKey,
    title: content.title,
    slug: {_type: 'slug', current: slug},
    serviceType: serviceTypeRef,
    order: order || 99,
    description: content.description,
    header: content.header,
    sellingPoints: content.sellingPoints,
    deliverables: {
      header: content.deliverables.header,
      items: content.deliverables.items.map((item) => ({
        _type: 'serviceDeliverable',
        ...item,
      })),
    },
    process: content.process,
    relatedWork: content.relatedWork,
  }

  console.log(`  Locale ${locale}: creating service "${content.title}" (_id: ${docId})`)
  await client.createOrReplace(doc)
}

async function main() {
  console.log('=== Seeding Services ===')
  console.log('Project:', projectId)
  console.log('Dataset:', dataset)
  console.log('Locales:', LOCALES_TO_SEED.join(', '))
  console.log('')

  const existingTypes = await listExistingServiceTypes()
  console.log('')

  for (const [serviceTypeValue, content] of Object.entries(SERVICES_CONTENT)) {
    // Check if this service type exists in Sanity
    const typeExists = existingTypes.some((t) => t.value === serviceTypeValue)
    if (!typeExists) {
      console.log(
        `Skipping "${content.title}" - serviceType "${serviceTypeValue}" not found in Sanity`,
      )
      continue
    }

    console.log(`Seeding service: ${content.title}`)

    for (const locale of LOCALES_TO_SEED) {
      try {
        const order = existingTypes.find((t) => t.value === serviceTypeValue)?.order
        await seedServiceForLocale(locale, serviceTypeValue, content, order)
      } catch (err) {
        console.error(`  Failed to seed ${serviceTypeValue} for locale ${locale}:`, err)
      }
    }
    console.log('')
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
