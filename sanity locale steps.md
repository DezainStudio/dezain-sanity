README — Sanity + OpenAI i18n Setup for Dezain Studio
Goal: scalable CMS with one-click OpenAI translations, safe SEO, clean dev UX. 0) TL;DR (Decisions)
Locale model: Sibling documents per locale (not field-level).
Link siblings with translationKey (UUID). Each doc has locale.
Default locale: en. Additional EU locales via config (e.g., lv, lt, et, pl, de, fr, es, it).
Translation engine: OpenAI API (primary). We call a serverless worker that:
pulls the source doc, 2) flattens text, 3) translates segments preserving structure, 4) rebuilds Portable Text, 5) writes a sibling doc, 6) (optionally) auto-publishes.
Modes: instant (auto-publish), reviewGate (draft needs approval), silentPrepare (keep drafts hidden).
SEO/i18n: Localized slugs, hreflang across siblings, per-locale sitemap, Next.js revalidate on publish.
Safety: Glossary + Do-Not-Translate (DNT) tokens, claim/legal gates, translation memory via sourceHash.

1. Data Model (shared fields)
   Every translatable doc type (e.g., page, service, caseStudy, newsPost, teamMember) includes:
   // shared fields (mixin)
   {
   name: 'locale', type: 'string', options: { list: ['en','lv','lt','et','pl','de','fr','es','it'] }, initialValue: 'en'
   },
   {
   name: 'translationKey', type: 'string', readOnly: true, description: 'Siblings share a UUID'
   },
   {
   name: 'sourceDocId', type: 'string', readOnly: true
   },
   {
   name: 'sourceHash', type: 'string', readOnly: true, description: 'Hash of source text used for MT'
   },
   {
   name: 'translationMeta',
   type: 'object',
   fields: [
   {name:'provider', type:'string'}, // 'openai'
   {name:'status',type:'string',options:{list:['machine','edited','approved']}},
   {name:'createdAt', type:'datetime'},
   {name:'reviewer', type:'string'}
   ]
   },
   // localized slug (unique per locale)
   {
   name:'slug', type:'slug', options:{ source: (doc)=>doc?.title, slugify: (s)=>slugifyLocale(s, doc.locale) }
   }

​
Per-field flags:
// Add to fields that must NOT be machine-translated
options: { i18n: { noTranslate: true, requiresHumanApproval: true } }

​ 2) Content Types (minimum viable)
page (generic structured pages)
service (service landing pages)
caseStudy
newsPost
teamMember
siteSettings (per locale; nav/footer, domain, toggles)
dictionary (per locale microcopy set)
glossaryTerm (source, targets[], notes, DNT toggle)
redirect (localized redirects)
mediaAsset (images with alt per locale in consuming docs)
Keep Portable Text for rich fields; links must be rewritten to localized slugs. 3) Desk Structure (Studio UX)
Left → Right flow:
Content
├─ Site Settings (one per locale)
├─ Dictionary (one per locale)
├─ Services
├─ Pages
├─ Case Studies
├─ News
├─ Team
├─ Glossary
└─ Redirects

​
Within each list, add filters:
Locale: en | lv | ...
Status: machine | edited | approved
Missing translation (custom view: show translationKey siblings not present for selected locale)
Document actions (top-right):
Translate → [lv] [lt] [pl] ...
Open Siblings
Mark as Approved 4) OpenAI Translation Flow
Endpoint: POST /api/translate (serverless)
Input: { sourceId, targetLocale, mode: 'instant'|'reviewGate'|'silentPrepare' }
Steps:
Fetch source doc (GROQ).
Flatten all translatable fields (title, summary, PortableText, alt, SEO).
Compute hash of source strings → check TM store. If hit → reuse.
Build system prompt (tone + DNT + glossary).
Call OpenAI → segmented translation (preserve inline marks & links).
Rebuild PortableText.
Generate localized slug & SEO (length clamps).
Create or update sibling doc with translationKey and metadata.
If mode==='instant' → publish.
Trigger ISR revalidate + sitemap/hreflang update.
Environment variables:
OPENAI_API_KEY=…
SANITY_PROJECT_ID=…
SANITY_DATASET=production
SANITY_TOKEN=… (mutations)
DEFAULT_LOCALE=en
ACTIVE_LOCALES=en,lv,lt,et,pl,de,fr,es,it

​ 5) OpenAI Call (pseudo)
import OpenAI from "openai"
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are a professional EU-localization translator for a premium design studio.
Style: clear, concise, humane, active voice. Preserve meaning, not word order.
Do NOT translate tokens in braces {}, model numbers, brand names, GS1/QR terms.
Keep sentence lengths tight. Respect legal/claims nuances.
Return only JSON with the same keys as input. No extra commentary.`

async function translateSegments(segments: Record<string,string>, to: string, glossary: Glossary, dnt: string[]) {
const user = {
targetLocale: to,
glossary,
doNotTranslate: dnt,
segments
}
const res = await openai.chat.completions.create({
model: "gpt-4o-mini", // fast + good; upgradeable
temperature: 0.2,
response_format: { type: "json_object" },
messages: [
{ role: "system", content: SYSTEM_PROMPT },
{ role: "user", content: JSON.stringify(user) }
]
})
return JSON.parse(res.choices[0].message.content)
}

​
Strategy: keep segmented JSON (flat keys) to preserve structure when rebuilding Portable Text. 6) Flatten & Rebuild (Portable Text)
Flatten: walk fields, extract text nodes (with path keys like body[3].children[1].text).
Rebuild: write translated strings back to the same paths; do not alter markDefs unless a link points to an internal slug—then map to localized slug.
Edge rules:
Keep inline code, strong, em marks.
Keep units / model numbers untouched (DNT).
ALT text must stay ≤ 140 chars; SEO title ≤ 60, description ≤ 150. 7) Slugs, SEO, Hreflang
Slug per locale: transliterate (latinize), kebab-case.
Ensure uniqueness within locale.
hreflang: for each translationKey, emit all siblings in head.
Sitemap: one per locale; add in robots; submit to Search Console.
Canonical: localized canonical per locale. 8) Modes & Gates
instant: auto-publish for low-risk types (e.g., news summaries).
reviewGate (default): draft; editors approve for services, legal, pricing, sustainability claims.
silentPrepare: create drafts; schedule publish on launch date.
Field-level requiresHumanApproval overrides mode (forces review). 9) Bulk Translate Tool (Studio)
Custom Studio tool:
Select types + date range + target locales
Choose mode
Show progress (queue), errors, cost estimate (optional)
Resume failed jobs
Under the hood: batch POST to /api/translate. 10) Next.js Integration (routing & ISR)
Folder: /[locale]/[...slug]/page.tsx
If doc missing in target locale → fallback to default locale (with lang="en" on HTML and a subtle locale notice).
On publish (Sanity webhook) → revalidate localized path.
Internal links: resolver maps by translationKey + locale. 11) Glossary & DNT
Schemas:
// glossaryTerm
{ name:'source', type:'string' },
{ name:'targets', type:'array', of:[{type:'object', fields:[{name:'locale',type:'string'},{name:'value',type:'string'}]}] },
{ name:'doNotTranslate', type:'boolean' },
{ name:'notes', type:'text' }

​
DNT sources:
glossaryTerm.doNotTranslate
Pattern lists: {Brand}, {SKU}, {GTIN}, {GS1}, units, model numbers via regex.
Pass both to the OpenAI prompt. 12) Translation Memory (TM)
Compute sourceHash (SHA256) over concatenated source strings and glossary version.
Store {hash, locale, translatedSegments} in KV (Upstash/Redis or Sanity tmEntry doc).
On next run, if hash matches → reuse translation, skip OpenAI call. 13) Document Actions (Studio)
Translate → [lv] [lt] … → hits /api/translate
Open Siblings → modal listing siblings by locale, with quick open/edit
Mark as Approved → sets translationMeta.status='approved' 14) Webhooks
On publish EN source → auto translate to selected locales using reviewGate (except types whitelisted for instant).
On glossary update → optionally invalidate TM entries for affected locales (version bump). 15) QA & Lints (Studio right panel)
Missing: ALT/SEO/Title in target.
Over length: SEO>60/150, ALT>140.
Claims: any field flagged requiresHumanApproval not yet approved.
Broken links: internal link target missing in locale. 16) Dev Steps (Windsurf/CodeX checklist)
Schemas
Add shared fields mixin; apply to page, service, newsPost, caseStudy, teamMember.
Create siteSettings, dictionary, glossaryTerm, redirect.
Desk
Build structure with locale/status filters + “Missing translations” view.
Add custom document actions.
API
Implement /api/translate (as above).
Add helper: flatten/rebuild Portable Text; slugify by locale; internal link mapping.
Add TM KV (Upstash) or Sanity doc store.
OpenAI
Wire client, system prompt, segmentation JSON protocol.
Add provider switch (future-proof).
Webhooks
Sanity → Next ISR revalidate.
Publish EN → translate to configured locales via reviewGate.
Next.js
Localized routes, fallback, hreflang, sitemaps per locale.
Link resolver by translationKey.
Tool
Build Bulk Translate Studio tool (batch queue UI).
QA
Lints: lengths, missing fields, claims gates, link integrity.
Docs
Editor guide: Translate button, Review queue, Approve & Publish.
Launch checklist: dictionary, siteSettings, sitemap submission. 17) Testing Checklist
Create EN service page → Translate to LV (reviewGate) → approve → live.
Update EN copy → hash changes → re-translate; LV shows diff; preserve marks/links.
Internal links resolve to localized slugs; fallback correct when missing.
ALT/SEO generated and within limits.
Sitemaps and hreflang valid; Search Console OK.
Glossary DNT respected (brand names, units, GS1).
Instant mode works for News; reviewGate for Services/Legal. 18) Notes on Cost/Perf
Use gpt-4o-mini as default; optional post-edit call only for Services.
TM avoids re-cost; batch jobs chunked to respect token limits.
Add rate limiting and retries; log provider latency & token usage. 19) Security
Sanity mutations via token on the serverless function (never client).
Validate sourceId, targetLocale, and doc types allowed to translate.
PII: none sent; redact secrets from documents before translation. 20) Done = ✅
Editors can Add Language, bulk translate, review, approve, and publish with zero developer hand-holding.
OpenAI output is on-brand, structure-safe, SEO-correct, and auditable.
