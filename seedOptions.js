// Import the Sanity client
import { createClient } from '@sanity/client'

// Create a client using environment variables
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// Define the data to seed
const skillsData = [
  { _type: 'skill', title: 'UI/UX', value: { _type: 'slug', current: 'ui-ux' } },
  { _type: 'skill', title: 'Illustration', value: { _type: 'slug', current: 'illustration' } },
  { _type: 'skill', title: 'Photography', value: { _type: 'slug', current: 'photography' } },
  { _type: 'skill', title: 'Motion Design', value: { _type: 'slug', current: 'motion-design' } },
  { _type: 'skill', title: 'Branding', value: { _type: 'slug', current: 'branding' } },
  { _type: 'skill', title: 'Web Development', value: { _type: 'slug', current: 'web-development' } },
]

const servicesData = [
  { _type: 'service', title: 'Brand Identity', value: { _type: 'slug', current: 'brand-identity' } },
  { _type: 'service', title: 'Website Design', value: { _type: 'slug', current: 'website-design' } },
  { _type: 'service', title: 'UI/UX Design', value: { _type: 'slug', current: 'ui-ux' } },
  { _type: 'service', title: 'Illustration', value: { _type: 'slug', current: 'illustration' } },
  { _type: 'service', title: 'Photography', value: { _type: 'slug', current: 'photography' } },
  { _type: 'service', title: 'Motion Design', value: { _type: 'slug', current: 'motion-design' } },
  { _type: 'service', title: 'Print Design', value: { _type: 'slug', current: 'print-design' } },
]

const workTypesData = [
  { _type: 'workType', title: 'Brand Identity', value: { _type: 'slug', current: 'brand-identity' } },
  { _type: 'workType', title: 'Website', value: { _type: 'slug', current: 'website' } },
  { _type: 'workType', title: 'UI/UX', value: { _type: 'slug', current: 'ui-ux' } },
  { _type: 'workType', title: 'Illustration', value: { _type: 'slug', current: 'illustration' } },
  { _type: 'workType', title: 'Photography', value: { _type: 'slug', current: 'photography' } },
  { _type: 'workType', title: 'Motion Design', value: { _type: 'slug', current: 'motion-design' } },
]

const clientTypesData = [
  { _type: 'clientType', title: 'Banking', value: { _type: 'slug', current: 'banking' } },
  { _type: 'clientType', title: 'NGO', value: { _type: 'slug', current: 'ngo' } },
  { _type: 'clientType', title: 'Service', value: { _type: 'slug', current: 'service' } },
  { _type: 'clientType', title: 'E-commerce', value: { _type: 'slug', current: 'e-commerce' } },
  { _type: 'clientType', title: 'Education', value: { _type: 'slug', current: 'education' } },
  { _type: 'clientType', title: 'Healthcare', value: { _type: 'slug', current: 'healthcare' } },
]

// Function to seed a specific type
async function seedType(data, type) {
  try {
    // Check if any documents of this type already exist
    const existing = await client.fetch(`*[_type == "${type}"]`)
    
    if (existing.length > 0) {
      console.log(`${type} documents already exist. Skipping seed.`)
      return
    }
    
    // Create a transaction to add all documents at once
    const transaction = client.transaction()
    
    // Add each document to the transaction
    data.forEach(doc => {
      transaction.create(doc)
    })
    
    // Commit the transaction
    await transaction.commit()
    console.log(`Successfully created ${data.length} ${type} documents!`)
  } catch (error) {
    console.error(`Error seeding ${type}:`, error)
  }
}

// Main function to seed all types
async function seedAll() {
  try {
    await seedType(skillsData, 'skill')
    await seedType(servicesData, 'service')
    await seedType(workTypesData, 'workType')
    await seedType(clientTypesData, 'clientType')
    console.log('All seeding completed!')
  } catch (error) {
    console.error('Error during seeding:', error)
  }
}

// Run the seed function
seedAll()
