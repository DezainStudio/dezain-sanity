# Dezain Studio CMS Content Guide

This guide explains what content goes where in your Sanity CMS, how localization (i18n) works in this project, and how to model global navigation and footer links based on your business and site structure.

Project files referenced below live under `schemaTypes/` unless noted.

## How localization works here

- **Localized documents**: Most content types include `...i18nSharedFields()` (see `i18n.ts`). This means you will have one document per locale and a shared `translationKey` to link variants.
- **Localized slugs**: Slugs are unique per locale using `isUniqueSlugWithinLocale()` and generated with `slugifyLocale()`.
- **Non-localized documents**: Some types (taxonomies) are intentionally not localized to keep stable IDs and slugs for filtering and data joins.

Implication: “Same content across locales” usually means there’s a separate document per locale with the same `translationKey`, but only textual fields differ. Structure and references should remain the same.

---

## Site-wide navigation and footer

### Where to put sidebar navigation (Portfolio, Services, Company)
- Use `siteSettings.navigation` in `siteSettings.ts`:
  - `label` is localized (varies by locale)
  - `url` is a string for internal slug or external URL

Example rows in `siteSettings.navigation` for `en`:
```json
[
  { "label": "Portfolio", "url": "/portfolio" },
  { "label": "Services",  "url": "/services" },
  { "label": "Company",   "url": "/company" }
]
```
In other locales, keep the `url` the same (or prefix with locale if your routing does so) and just translate `label`.

### Where to put footer links
- Recommended: Add a footer structure to `siteSettings` so it’s editable alongside navigation, per locale.
- Practical shape (to add to `siteSettings.ts`):
```ts
{
  name: 'footer',
  title: 'Footer',
  type: 'object',
  fields: [
    {
      name: 'groups',
      title: 'Link Groups',
      type: 'array',
      of: [{
        type: 'object',
        name: 'group',
        fields: [
          { name: 'title', title: 'Group Title', type: 'string' },
          {
            name: 'links',
            title: 'Links',
            type: 'array',
            of: [{
              type: 'object',
              name: 'link',
              fields: [
                { name: 'label', title: 'Label', type: 'string' },
                { name: 'url',   title: 'URL / Slug', type: 'string' }
              ],
              preview: { select: { title: 'label', subtitle: 'url' } }
            }]
          }
        ]
      }]
    }
  ]
}
```
- Why localize `siteSettings` per locale? Because labels (and group titles) need translation even if the link structure stays the same. Keeping this in `siteSettings` lets editors translate UI strings without touching code.

Alternative (if you want only one `siteSettings` across locales):
- Keep a single non-localized `globalSettings` for link structure and URLs.
- Store all UI labels/strings in per-locale `dictionary` (see below) and reference by keys (e.g., `footer.companyTitle`, `footer.links.privacy`). This reduces duplication but introduces key management discipline.

---

## Content types and where to put things

### Landing page (`landing.ts`)
- Sections:
  - `hero`: `title`, `subtitle`, `ctaText`, `ctaLink`, `image`
  - `sellingPoints`: `cardCarousel`
  - `imageCta`: `imageCTA` (background image, title, subtitle, primary/secondary buttons)
- Use this document per locale for your home page content.

### Portfolio (`portfolio.ts`)
- Localized per locale.
- List/grid views should query `title`, `subtitle`, `coverImage`.
- Detail pages render `content` blocks, `gallery`, optional `video`.
- Filtering and categorization use references to taxonomies:
  - `services` → `serviceType[]`
  - `workType[]`
  - `clientType[]`
- Creators are referenced via `creators[]` → `creator`.

### Services (`service.ts`)
- Localized per locale.
- Structured sections for marketing content and an optional `cardCarousel`.
- Classified by `serviceType` (taxonomy), which supports filtering.

### Creators (`creator.ts`)
- Localized per locale.
- Intended as real content entities (image, skills, references) rather than simple tags. Even if the person is the same across locales, the localized doc allows translated slugs and name variants.
- If you truly never localize creators (names don’t change, no localized fields needed), you can make `creator` non-localized by removing `i18nSharedFields()` and the localized slug logic.

### Testimonials (`testimonial.ts`)
- Localized per locale.
- References `portfolio` for context and includes images for avatars/logos.

### Legal pages (`legal.ts`)
- Localized per locale (Terms, Privacy, Cookies). Each locale has its own document with a localized slug and rich content.

---

## Dictionary vs Glossary vs Site Settings

### Dictionary (`dictionary.ts`)
- Localized document containing generic UI strings and labels as key/value pairs.
- Good for: UI copy (buttons, headings), nav labels, footer link labels (if you choose the “one global settings + keys” approach), and any microcopy that should be translated but isn’t page content.
- Example entries for English:
```json
{
  "entries": [
    { "key": "nav.portfolio", "value": "Portfolio" },
    { "key": "nav.services",  "value": "Services" },
    { "key": "nav.company",   "value": "Company" },
    { "key": "footer.privacy", "value": "Privacy Policy" }
  ]
}
```

### Glossary (`glossaryTerm.ts`)
- Central list of domain/brand terms for translation. Each term has localized targets inline with explicit `locale` codes.
- Good for: Consistent translations of product names, technical terms, phrases that appear across multiple documents.
- Also supports `doNotTranslate` for terms like brand names.
- Use in editorial guidelines and optionally automate QA to flag inconsistencies.

### Site Settings (`siteSettings.ts`)
- Localized settings for:
  - `siteTitle`
  - `navigation` (sidebar/top nav)
  - `footer` (recommended addition for groups/links)
- Why per-locale? Your team can change labels/translations without developer involvement, and you may occasionally vary locale-specific settings (e.g., country-specific notices).

---

## Taxonomies (non-localized enums)

- Types: `serviceType`, `workType`, `clientType`.
- Purpose: Stable IDs and slugs (via `value.current`) for filtering and categorization across all locales.
- Translation strategy for display labels:
  - Keep taxonomy documents non-localized.
  - Display labels via one of:
    1. **Dictionary by slug**: Build keys like `taxonomy.serviceType.<slug>` and translate in `dictionary` per locale.
    2. **Add labels to taxonomy**: Add a `labels` field (array of `{locale, value}`) similar to `glossaryTerm.targets`.

Example dictionary keys for taxonomy labels:
```json
{
  "entries": [
    { "key": "taxonomy.serviceType.branding", "value": "Branding" },
    { "key": "taxonomy.workType.print", "value": "Print" },
    { "key": "taxonomy.clientType.startup", "value": "Startup" }
  ]
}
```
Frontend display pattern:
```ts
// Given a taxonomy doc with value.current = 'branding'
const key = `taxonomy.serviceType.${valueCurrent}`
const label = dictionary[key] ?? taxonomy.title // fallback
```

Why not make creators a taxonomy? Creators are content entities (images, skills, optional bio) and can be referenced with rich previews. Taxonomies are for lightweight classification. If you only need a flat, non-localized label and slug, taxonomy fits; otherwise, keep `creator` as a full document.

---

## GROQ examples

Fetch `siteSettings` for a given locale (e.g., `en`):
```groq
*[_type == 'siteSettings' && locale == $locale][0]{
  siteTitle,
  navigation[]{ label, url },
  footer{
    groups[]{
      title,
      links[]{ label, url }
    }
  }
}
```

Fetch `dictionary` for a given locale as a key/value map:
```groq
let dict = *[_type == 'dictionary' && locale == $locale][0].entries[]{ key, value }
```

Fetch portfolio list for a locale with taxonomy slugs for filtering:
```groq
*[_type == 'portfolio' && locale == $locale]{
  _id,
  title,
  subtitle,
  'slug': slug.current,
  coverImage,
  'serviceSlugs': services[]->value.current,
  'workTypeSlugs': workType[]->value.current,
  'clientTypeSlugs': clientType[]->value.current,
}
```

---

## Recommended modeling decisions (summary)

- **Sidebar nav**: `siteSettings.navigation` per locale. Translate `label`, keep `url` stable.
- **Footer**: Add `siteSettings.footer` (groups/links). Translate `title`/`label`s per locale.
- **Dictionary**: Use for reusable UI strings and, optionally, taxonomy display labels keyed by slug.
- **Glossary**: Manage authoritative translations of domain terms; mark `doNotTranslate` where needed.
- **Taxonomies**: Keep non-localized for stable filtering; translate labels via dictionary or add a `labels` field.
- **Creators**: Keep as content type (localized) for richer data; consider non-localized only if truly identical across locales.

---

## Next steps (optional)

1. Update `siteSettings.ts` to add the `footer` structure shown above.
2. Decide whether taxonomy display labels should come from `dictionary` (by slug) or from a new `labels` field on each taxonomy doc.
3. If you prefer a single global settings doc, we can split settings into:
   - `globalSettings` (non-localized structure + URLs)
   - `siteSettings` (localized labels and small locale-specific toggles)

If you want, I can implement the `footer` schema in `siteSettings.ts` and add a small helper for looking up dictionary entries by key.
