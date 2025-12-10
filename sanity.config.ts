import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {deskStructure} from './deskStructure'
import {translateAction} from './documentActions/translate'
import {openSiblingsAction} from './documentActions/openSiblings'

console.log('sanity config env debug', {
  SANITY_STUDIO_TRANSLATE_API_URL: process.env.SANITY_STUDIO_TRANSLATE_API_URL,
})

export default defineConfig({
  name: 'default',
  title: 'Dezaın Studıo',

  projectId: process.env.SANITY_PROJECT_ID || '15jlhba6',
  dataset: process.env.SANITY_DATASET || 'v2',

  plugins: [structureTool({structure: deskStructure}), visionTool()],

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: 'landing-by-locale',
        title: 'Landing (by locale)',
        schemaType: 'landing',
        parameters: [{name: 'locale', type: 'string'}],
        value: (params: {locale?: string}) => ({
          locale: params?.locale,
        }),
      },
    ],
  },
  document: {
    actions: (prev) => {
      return [translateAction, openSiblingsAction, ...prev]
    },
  },
})
