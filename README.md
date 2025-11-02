# Dezain Studio — Sanity v4 CMS (Top‑Level i18n)

This repository hosts the Sanity v4 Content Studio for Dezain Studio with top‑level, document‑per‑locale internationalization (i18n). Each localized document is a sibling linked via a shared `translationKey`. Slugs are localized and enforced unique within each locale.

Use this README as both a quick reference and a living requirements document. Edit the “Backlog / Requirements” section and we will update the project to match.

---

## TL;DR

- **i18n model:** sibling documents per locale; linked by `translationKey`.
- **Locales:** configured in `schemaTypes/i18n.ts` (`ACTIVE_LOCALES`, `DEFAULT_LOCALE`).
- **Localized slug:** `slugifyLocale()` and `isUniqueSlugWithinLocale()` ensure locale‑scoped, URL‑safe slugs.
- **Desk structure:** content grouped by locale at the top level; singletons and lists per locale.
- **Add a new content type once** (schema) → available in all locales automatically.

---

## Getting Started

Scripts (from `package.json`):

- `npm run dev` → start Studio locally
- `npm run build` → build Studio
- `npm run deploy` → deploy Studio (Sanity hosted)
- `npm run deploy-graphql` → deploy GraphQL (optional)

Environment/dataset:

- `sanity.config.ts` uses `process.env.SANITY_DATASET || 'v2'`.
- `sanity.cli.ts` currently points to dataset `process.env.SANITY_DATASET || 'v2'`.
- Choose one dataset name and align both files (recommended).

---

## Directory Highlights

- `sanity.config.ts` → registers schema types and desk structure; adds a per‑locale Landing template.
- `deskStructure.ts` → custom Desk; groups content by locale; adds per‑locale Landing singleton.
- `schemaTypes/` → all schemas and i18n utilities:
  - `i18n.ts` → `ACTIVE_LOCALES`, `DEFAULT_LOCALE`, `i18nSharedFields()`, `slugifyLocale()`, `isUniqueSlugWithinLocale()`, `withI18nInitialValue()`.
  - Localized content: `landing.ts` (singleton), `service.ts`, `portfolio.ts`, `newsroomArticle.ts`, `creator.ts`, `testimonial.ts`, `legal.ts`, `video.ts`, `redirect.ts`.
  - Non‑localized taxonomies: `serviceType.ts`, `skill.ts`, `workType.ts`, `clientType.ts`, `newsroomCategory.ts`.
  - i18n infra: `siteSettings.ts`, `dictionary.ts`, `glossaryTerm.ts`.
  - Reusable blocks: `cardCarousel.ts`.

---

## i18n Model (Top‑Level)

Every localized document includes the following fields via `i18nSharedFields()`:

- `locale: string` (one of `ACTIVE_LOCALES`; default `DEFAULT_LOCALE`)
- `translationKey: string` (UUID shared by all locale siblings)
- `sourceDocId: string` (origin doc `_id` used for machine translation; optional)
- `sourceHash: string` (for translation memory; optional)
- `translationMeta: { provider, status, createdAt, reviewer }`

Localized slugs:

- Use `slugifyLocale()` for ascii, kebab‑case slugs with diacritics removed.
- Use `isUniqueSlugWithinLocale()` to enforce uniqueness in (`_type`, `locale`).

Sibling resolution examples (GROQ):

```groq
// Get all siblings for a doc by _id
*[_id == $id][0]{
  _type,
  translationKey,
  "siblings": *[_type == ^._type && translationKey == ^.translationKey]{
    _id, locale, "slug": slug.current
  }
}

// Fetch sibling for a specific locale
*[_type == $type && translationKey == $translationKey && locale == $locale][0]{
  _id, locale, "slug": slug.current
}
```

---

## Desk Structure (Studio UX)

- Top‑level groups by locale (`en`, `lv`, …).
- Under each locale:
  - `Landing` → singleton opened by fixed ID: `landing-<locale>`.
  - Lists for localized types (Service, Portfolio, Creator, Legal, Testimonial, Video, Redirect, Site Settings, Dictionary).
- A separate “Taxonomies” group contains non‑localized types (Service Types, Skills, Work Types, Client Types, Newsroom Categories) and `Glossary`.

File: `deskStructure.ts`.

---

## Schemas

### Localized Content

- `landing` (singleton per locale)

  - Hero (heading, subheading, description, button, media)
  - Sections: `richSection` (title/body/image), `cardCarousel` (reusable block)

- `service`

  - Section 1: Title (H1), Slug, `serviceType` (ref), Subtitle (H2), Description (≤140 chars), Button (title/url/variant), Media (1 image or video ref)
  - Section 2: Title (H2), Body (PT), Image (1x1)
  - Section 3: Title (H2), Subtitle (H3), Cards×3 (SVG icons, title, text ≤100)
  - Section 4: Title (H2), Title Primary (H3), Title Muted (H3), Cards (image PNG, title, subtitle ≤60)
  - Section 5: Title (H2), Subtitle (H3), Subheading (H4), Cards (SVG icons, title, text ≤100)
  - Optional `cardCarousel`

- `portfolio`

  - Title, Slug, Portable Text content (images/videos/galleries), refs to `creator`, `workType`, `clientType`, and `services` as refs to `serviceType` taxonomy.

- `newsroomArticle`

  - Basics: Title (≤110), Slug (unique per locale), Dek (140–180 chars), optional Read Minutes
  - Classification: required `category` (ref → `newsroomCategory`), optional `authors` (ref → `creator`), optional `relatedServices` (refs → `serviceType` or `service`)
  - Timing: `publishedAt` (required), `embargoAt`, `featured`, `pinUntil`
  - Hero: `heroStyle` = image or video with conditional validations
  - Body: portable text, images, video embeds (file/YouTube/Vimeo), pull quotes, CTA block
  - Gallery: optional image grid
  - Social: only required when Category = Social (platform, caption 70–200 chars, postUrl or media)
  - SEO: metaTitle, metaDescription, canonical, image
  - Flags: `hideFromFeeds`, `workflow`

- `creator`, `testimonial`, `legal`, `video`, `redirect`
  - Standard localized docs with localized slugs and i18n fields.

### Non‑localized Taxonomies

- `serviceType`, `skill`, `workType`, `clientType` (simple Title + Slug value)
- `newsroomCategory` (Name, Slug, optional Description, SVG icon)

### i18n Infra

- `siteSettings` (per locale): nav/footer text, domain, etc.
- `dictionary` (per locale): microcopy key/value store (e.g., labels, button texts)
- `glossaryTerm` (shared): term preferences/Do‑Not‑Translate for translation pipeline

### Reusable Blocks

- `cardCarousel` (object): title/subtitle + cards (icon(s), optional image, title, text ≤100, optional button)

---

## Using Taxonomies (Collections)

- **Non‑localized by design**: A single set shared across locales for consistent classification.
- **Where they are used**
  - `serviceType` → `service.serviceType` and `portfolio.services[]`
  - `skill` → `creator.skills[]`
  - `workType` → `portfolio.workType[]`
  - `clientType` → `portfolio.clientType[]`
  - `newsroomCategory` → `newsroomArticle.category`
- **How to manage**
  - Create new taxonomy items in the Taxonomies group. Each has a Name and Slug (auto from name).
  - Do not translate these. Names should be editorially neutral and short.
  - Changing a taxonomy updates all content referencing it.

---

## Site Settings (Per‑locale)

File: `schemaTypes/siteSettings.ts`

- **Fields**
  - `siteTitle` (required)
  - `domain` (primary URL)
  - `navigation[]` of `{label, url}` (internal slug or full URL)
  - `footerText`
- **Typical usage**
  - Build header nav and footer from this document for the active locale.
  - Keep labels localized; use absolute URLs for off‑site links.

---

## Dictionary (Per‑locale microcopy)

File: `schemaTypes/dictionary.ts`

- **Purpose**: Central store of UI strings (button labels, small messages) per locale.
- **Shape**: `entries[]` of `{ key, value, notes }`.
- **Conventions**
  - Use dot‑keys (e.g., `cta.primary`, `footer.legal`) for grouping.
  - Keys should be stable; change values to update text.
- **Frontend**
  - Query per locale and inject into your app’s i18n layer.
  - Example (already in this README under “Useful GROQ Snippets”).

---

## Glossary Term (Translation guidance)

File: `schemaTypes/glossaryTerm.ts`

- **Purpose**: Maintain preferred translations or mark terms as Do‑Not‑Translate for MT and editorial review.
- **Fields**: `source`, `targets[{locale, value}]`, `doNotTranslate`, `notes`.
- **Notes**
  - Not rendered directly on the site; used by translation tooling/pipelines.
  - Helps keep brand and domain terminology consistent across locales.

---

## Content Types Overview (What each is for)

- **Landing**: Home page per locale. Hero and key sections; singleton per locale.
- **Service**: Service detail pages used for marketing; can feature carousels and structured sections.
- **Portfolio**: Case studies and work examples; rich body with images, videos, and galleries; linked to creators and taxonomies.
- **Newsroom Article**: Press releases, updates, insights, etc.; includes classification, hero, body, social, and SEO.
- **Creator**: Authors or team members to attribute work and articles; connect skills.
- **Testimonial**: Client quotes with attribution; referenced where needed.
- **Legal**: Policy and legal pages (e.g., Privacy, Terms) per locale.

## Add a New Localized Schema

1. Create `schemaTypes/<yourType>.ts`:

- `type: 'document'`
- `initialValue: withI18nInitialValue()`
- Prepend `...i18nSharedFields()`
- Add a slug field using `slugifyLocale` + `isUniqueSlugWithinLocale` if needed.

2. Export it in `schemaTypes/index.ts`.

3. (Optional) Add to `localizedTypes` in `deskStructure.ts` to appear explicitly under each locale.

---

## Add or Remove a Locale

- Edit `ACTIVE_LOCALES` and `DEFAULT_LOCALE` in `schemaTypes/i18n.ts`.
- The desk and slug behavior adapt automatically.

---

## Data & Migrations (if content exists later)

- Adding i18n to an existing dataset requires backfilling `locale` and `translationKey` on current docs.
- For empty datasets (this project), you’re fine—initial values populate on create.
- If you later need to migrate:
  - Back up the dataset: `sanity dataset export <dataset> ./backup.tgz`
  - Patch missing fields with a script (see example in `sanity locale steps.md`).

---

## Backlog / Requirements (Edit this section)

- [x] Top‑level i18n (sibling docs) with `translationKey`
- [x] Localized slugs and uniqueness per locale
- [x] Custom Desk grouping by locale (with Landing singleton per locale)
- [x] Localized content types: `landing`, `service`, `portfolio`, `creator`, `testimonial`, `legal`, `video`, `redirect`
- [x] Taxonomies: `serviceType`, `skill`, `workType`, `clientType`
- [x] i18n infra: `siteSettings`, `dictionary`, `glossaryTerm`
- [x] Reusable block: `cardCarousel`
- [ ] Add reusable `link` object (internal ref or external URL) and use in buttons/annotations
- [ ] Document actions: Translate → siblings, Open Siblings, Mark as Approved
- [ ] `/api/translate` serverless function (OpenAI) with flatten/rebuild, glossary & DNT, TM cache
- [ ] Translation Memory store (Upstash/Redis or Sanity docs)
- [ ] Next.js integration: localized routes, ISR/revalidate, hreflang, sitemaps per locale
- [ ] QA panel: ALT/SEO lengths, missing fields, claims gates, link integrity
- [ ] Align dataset names in `sanity.config.ts` and `sanity.cli.ts`

> Edit the checklist above to drive development. After you update it, we’ll adjust the project to match.

---

## Useful GROQ Snippets

Fetch `siteSettings` and `dictionary` with fallback:

```groq
{
  "site": coalesce(
    *[_type == "siteSettings" && locale == $locale][0],
    *[_type == "siteSettings" && locale == $default][0]
  ),
  "dict": coalesce(
    *[_type == "dictionary" && locale == $locale][0].entries,
    *[_type == "dictionary" && locale == $default][0].entries
  )
}
```

Fetch page by (type, locale, slug):

```groq
*[_type == $type && locale == $locale && slug.current == $slug][0]
```

---

## Notes

- Slug transliteration is ASCII‑only and strips diacritics (works for EU locales we target).
- Landing is a singleton per locale via fixed document IDs (`landing-<locale>`).
- Editors could still create another `landing` via the global Create menu; if we want to hard‑enforce singletons, we can add guards (custom document actions or new document options).

---

## License

Private/UNLICENSED for Dezain Studio.
