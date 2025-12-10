import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_TOKEN

if (!projectId || !dataset) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_DATASET environment variables')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-05-01',
  token,
  useCdn: false,
})

async function main() {
  console.log('Fetching portfolio documents…')

  const docs = await client.fetch(
    `*[_type == "portfolio"] | order(locale asc, slug.current asc){
      _id,
      locale,
      "slug": slug.current,
      translationKey,
      title
    }`,
  )

  console.log(`Fetched ${docs.length} portfolio documents`)
  console.log('\nJSON output (you can redirect this to a file):')
  console.log(JSON.stringify(docs, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
