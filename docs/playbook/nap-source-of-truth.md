# NAP & Entity Source of Truth

**Purpose:** the single approved record of kool studio's Name / Address / Phone and core entity facts. Every surface — website, JSON-LD, `/llms.txt`, GBP, Bing Places, directories, press kits — must match this sheet. When any fact changes, change it **here first**, then propagate to every row in the "where this fact appears" column.

**Provenance rule:** every value below is populated **only** from what the repository already publishes. Facts the repo does *not* contain are marked `[REQUIRES CONFIRMATION]` and must be resolved via `decision-log.md` (gate G1) before they go on any external profile. Do not copy the LinkedIn-sourced facts from the playbook (e.g. team size, "Aleksandra" name form) onto live surfaces until confirmed — they are not in the repo.

**Owner:** Local owner + Business owner (per playbook §4.2, §9). Last reconciled against repo: 2026-07-22.

---

## 1. Name

| Field | Value (from repo) | Where this fact appears |
|---|---|---|
| Trade name (canonical, schema) | **Kool Studio** | JSON-LD `name` (`app/[locale]/layout.tsx`); `metadata.title.default` |
| Display styling (lowercase brand) | **kool studio** | `metadata.title.template` (`%s \| kool studio`); llms.txt heading; site chrome |
| Social handle styling | **kool.studio** | Instagram handle (`lib/site.ts`); llms.txt |
| Legal / registered company name | `[REQUIRES CONFIRMATION]` — not published in repo | (target: `Organization.legalName`) |
| Company registration (NIP / REGON / KRS) | `[REQUIRES CONFIRMATION]` — not in repo | (target: invoicing/legal footer, entity graph) |

> **Rule (§9.1):** use the exact real-world name. Never append keywords or cities ("Kool Studio Wrocław interior design") on GBP or profiles.

## 2. Address

| Field | Value (from repo) | Where this fact appears |
|---|---|---|
| Street address | **Zaporoska 83/15** | JSON-LD `address.streetAddress` (`layout.tsx`); footer string `"STUDIO: ZAPOROSKA 83/15, WROCŁAW"` (`messages/pl.json` + `en.json`, key `footer.address`); llms.txt line 43 |
| Postal code | **53-415** | JSON-LD `address.postalCode`; llms.txt line 43 |
| City (locality) | **Wrocław** | JSON-LD `address.addressLocality`; footer string; llms.txt |
| Region | **Dolnośląskie** (Lower Silesia) | JSON-LD `address.addressRegion` |
| Country | **PL** (Poland) | JSON-LD `address.addressCountry`; llms.txt |
| Geo coordinates | **lat 51.09168, lng 17.01557** | JSON-LD `geo` (`layout.tsx`) |
| Map link | **https://maps.app.goo.gl/f3nJEyLJXxKStLvPA** | JSON-LD `hasMap`; `AddressBlock.tsx` (`<a href>`), used on homepage footer + kontakt page |
| Reception / service-area policy | `[REQUIRES CONFIRMATION]` — is this a client-receiving office or service-area-only? (governs whether the address is shown or hidden on GBP, and `LocalBusiness` vs `Organization` schema) | See `decision-log.md` G1-3 |

> **Consistency note:** the address is displayed as `STUDIO: ZAPOROSKA 83/15, WROCŁAW` (no postal code) in the footer/kontakt UI, but the full postal address (`53-415`, region, country) exists only in JSON-LD and llms.txt. Keep both representations pointing at the same real address.

## 3. Phone & contact

| Field | Value (from repo) | Where this fact appears |
|---|---|---|
| Email | **hello@koolstudio.pl** | JSON-LD `email` (`layout.tsx`); `AddressBlock.tsx` (`mailto:`); footer string `footer.email`; llms.txt line 47; kontakt page |
| Phone | `[REQUIRES CONFIRMATION]` — **no phone published anywhere** in the repo | (target: GBP, NAP, brief-form alternative contact §7.3) — see `decision-log.md` G1-2 |
| Opening hours | `[REQUIRES CONFIRMATION]` — not published in repo | (target: GBP, `LocalBusiness` `openingHours`) — see G1-1 |

## 4. Web & social profiles

| Field | Value (from repo) | Where this fact appears |
|---|---|---|
| Website (BASE_URL) | **https://koolstudio.pl** | `lib/site.ts` `BASE_URL`; JSON-LD `url`; `metadataBase`; llms.txt |
| Instagram | **https://www.instagram.com/kool.studio/** | `lib/site.ts` `INSTAGRAM_URL`; JSON-LD `sameAs`; llms.txt line 48; `FooterBar` |
| LinkedIn | `[REQUIRES CONFIRMATION]` — playbook §3.1 cites `pl.linkedin.com/company/koolstudio`, but this URL is **not referenced anywhere in the repo** | (target: JSON-LD `sameAs`) — see G1-6 |
| Google Business Profile URL | `[REQUIRES CONFIRMATION]` — only a `maps.app.goo.gl` share link exists; GBP ownership/claim status unknown | see G6-1 |
| Bing Places | `[REQUIRES CONFIRMATION]` — not in repo | see G6-2 |
| Other directories (Oferteo, etc.) | `[REQUIRES CONFIRMATION]` — §3.1 notes an Oferteo profile with unverified reviews; not a repo fact | verify before listing as `sameAs` |

## 5. People (founders)

| Field | Value (from repo) | Where this fact appears |
|---|---|---|
| Founder 1 | **Ola Kilińska** | JSON-LD `founder[]` (`layout.tsx`); `messages/*.json` (`meta.*.description`, `studio.heroImageAlt`, studio intro); llms.txt line 24 |
| Founder 2 | **Ola Leszczyńska** | JSON-LD `founder[]`; `messages/*.json`; llms.txt line 24 |
| Full legal names | `[REQUIRES CONFIRMATION]` — playbook §3.1 uses "Aleksandra Kilińska / Aleksandra Leszczyńska"; repo uses the diminutive "Ola". Reconcile before `Person` schema. | see G1-5 |
| Roles | **architects** ("architektki" / "architects") | `messages/*.json` studio intro & meta descriptions; llms.txt |
| Team size | `[REQUIRES CONFIRMATION]` — §3.1 reports "2–10" from LinkedIn (self-reported); **not** a repo fact — do not publish as objective | — |

## 6. Business descriptors & service facts

| Field | Value (from repo) | Where this fact appears |
|---|---|---|
| Schema type currently used | **`ProfessionalService`** | JSON-LD `@type` (`layout.tsx`) — ⚠ playbook §10.1 flags `ProfessionalService` as **deprecated**; migrate to `Organization` or `LocalBusiness` (pending G1-3). Flag, do not silently change. |
| Entity `@id` | `https://koolstudio.pl/#studio` | JSON-LD `@id` |
| Area served | **Wrocław, Warszawa, Poland** | JSON-LD `areaServed`; llms.txt "Service area: Wrocław, Warsaw, and all of Poland"; keywords |
| Service types (schema) | Interior Architecture · Interior Design · Custom Furniture Design · Lighting Design · Visual Identity Design | JSON-LD `serviceType` |
| Services (llms.txt prose) | Interior architecture (concept, construction documentation, author supervision) · Custom furniture · Custom lighting · Visual identity & branding · Uniform design · **Sanepid/sanitary-approval support** | llms.txt lines 34–40 |
| Languages | **pl, en** | JSON-LD `knowsLanguage` |
| Logo | `https://koolstudio.pl/logo.svg` | JSON-LD `logo`; `public/logo.svg` |
| Brand image | `https://koolstudio.pl/images/studio/team.webp` | JSON-LD `image` |

> **Flag for review (G5):** llms.txt asserts "Sanitary-approval (Sanepid) support for food-service venues" as a service. This is a competence claim that needs a named owner/reviewer before it is repeated on GBP or Services pages (see `decision-log.md` G5-3). It is included here only because the repo already publishes it — not as confirmation that it should stay.

---

## 7. Missing-fields checklist (blocks GBP / Bing / full entity graph)

Resolve each in `decision-log.md`, then add it to every surface in one pass:

- [ ] Phone number — G1-2
- [ ] Opening hours (or "by appointment") — G1-1
- [ ] Address reception policy (show vs hide on GBP) — G1-3
- [ ] Legal name + registration numbers — G1-4
- [ ] Founder full legal names (Ola vs Aleksandra) — G1-5
- [ ] LinkedIn URL — G1-6
- [ ] GBP ownership/claim + primary category — G6-1 (+ §9.1 category `[REQUIRES CONFIRMATION]`)
- [ ] Bing Places ownership — G6-2

## 8. Propagation checklist (when any confirmed fact changes)

Update, in this order, and verify parity:

1. `data/` / `lib/site.ts` / `messages/pl.json` + `messages/en.json` (keep PL/EN parity — `pnpm check:i18n`)
2. JSON-LD block in `app/[locale]/layout.tsx`
3. `app/llms.txt/route.ts` prose (note: project facts there are generated from `data/projects.ts`; NAP/contact block is hand-written)
4. Google Business Profile
5. Bing Places
6. Any directory / `sameAs` profile
7. Press kits (`press-kit-*.md`)

Per playbook §9.1/§10.3, all seven must assert identical facts. A mismatch between visible content and JSON-LD is a production-gate failure.
