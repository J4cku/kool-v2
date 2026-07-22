# Decision Log — Confirmation Gates & Open Business Facts

**Purpose:** master register of every business decision the SEO / AI-visibility / lead-gen playbook marks `[REQUIRES CONFIRMATION]` or gates behind **G0–G6**. No implementation work that depends on one of these facts may ship until the row is resolved. This is the single place to record who decides and when.

**Scope rule (hard):** engineering may build *structure* (empty service pages, form scaffold, schema shells, ops docs) ahead of a decision, but must **never publish a business fact** — price, hour, phone number, SLA, capacity claim, review quote, scope promise — until the corresponding row below moves to `RESOLVED` with a written owner decision. See playbook §2.3 (evidence hierarchy) and §2.4 (gates).

**How to use:** work the `OPEN` rows top-down. When a decision is made, change `Status` to `RESOLVED`, fill `Date`, and record the exact wording of the decision in the CRM / decision doc referenced by the approver. Do not delete rows — supersede them.

**Legend — Status:** `OPEN` (undecided, blocking) · `RESOLVED` (owner decision recorded) · `DEFERRED` (consciously parked with a review date).

---

## Part A — Confirmation gates G0–G6

| ID | Gate | Decision needed | Why it blocks / what it unlocks | Suggested approver | Status | Date |
|---|---|---|---|---|---|---|
| G0-1 | G0 business fit | Confirm the **3–4 preferred project types** the studio actively wants (e.g. apartments, houses, commercial/hospitality, brand+space) | Blocks B01 (ideal-project + qualified-lead definition), page targeting for the Services hub (B04), brief-form routing (B05), and all positioning copy. Unlocks the whole P0 sequence. | Founders / business owner | OPEN | — |
| G0-2 | G0 business fit | Confirm **exclusions** — project types, sectors, or job sizes the studio will *not* take | Prevents landing pages and AI answers from advertising work the studio won't do; feeds "non-fit reason codes" in B01. | Founders / business owner | OPEN | — |
| G0-3 | G0 business fit | Confirm **minimum viable scope** (smallest engagement accepted — e.g. layout-only? single room? full documentation only?) | Directly answers FAQ F02/F04; sets the floor for brief-form qualification and for what the Services pages may promise. | Founders / business owner | OPEN | — |
| G0-4 | G0 business fit | Confirm **current capacity** and commercial priorities (how many concurrent projects, which are priority) | Governs whether landing-page experiments and PR may proceed (a page with no capacity behind it must not ship — §2.6 stop condition). | Founders / business owner | OPEN | — |
| G0-5 | G0 business fit | Approve the **positioning statement** (§3.4 proposed line is pending G0) | Blocks homepage / Services / Studio copy and the AI-audit "brand facts" baseline. | Founders / business owner | OPEN | — |
| G1-1 | G1 public facts | Confirm **opening hours** (or "by appointment only" policy) | Not published anywhere in the repo. Required for GBP (B07), Bing Places, and any `LocalBusiness`/hours schema. Blocks the local entity workstream. | Business owner | OPEN | — |
| G1-2 | G1 public facts | Confirm a **public phone number** (or a documented "email-only" decision) | No phone appears on the site, in JSON-LD, or in llms.txt. Blocks NAP completeness (B07), GBP, and the "alternative contact path" the brief form requires (§7.3). | Business owner | OPEN | — |
| G1-3 | G1 public facts | Confirm the **address & reception policy**: is Zaporoska 83/15, 53-415 Wrocław a client-receiving office, or service-area only? | The address is *already published* (JSON-LD in `app/[locale]/layout.tsx`, footer strings, llms.txt line 43). GBP rules (§9.1) require hiding the address if clients are not received there. Decides `LocalBusiness` vs `Organization` schema (§10.1). | Business owner | OPEN | — |
| G1-4 | G1 public facts | Confirm the **legal/registered name** and company registration (NIP/REGON/KRS) for the entity graph and any invoicing/legal blocks | Site publishes only the trade name "Kool Studio". Needed before `Organization` legal-name schema and any B2B/contract page. | Business owner | OPEN | — |
| G1-5 | G1 public facts | Confirm **founder legal names & bios** — site/JSON-LD say "Ola Kilińska" and "Ola Leszczyńska"; playbook §3.1 cites "Aleksandra Kilińska / Aleksandra Leszczyńska" (LinkedIn) | Name mismatch (Ola ↔ Aleksandra) must be reconciled before `Person` schema and bio pages, or the entity graph will assert conflicting facts. | Business owner | OPEN | — |
| G1-6 | G1 public facts | Confirm **official profile URLs** to list as `sameAs` — LinkedIn (`pl.linkedin.com/company/koolstudio` per §3.1 but **not** in repo), GBP, Bing Places, any others | Only Instagram is currently referenced (`lib/site.ts`). `sameAs` completeness helps entity disambiguation (§10, §11). | Business owner | OPEN | — |
| G2-1 | G2 service truth | Confirm the **exact design phases** and what each delivers | Blocks the process pillar (B11), Services pages (B04), and FAQ F09/F10. Answers must come from approved service truth, never competitor practice (§14.7). | Studio lead + legal/commercial reviewer | OPEN | — |
| G2-2 | G2 service truth | Confirm the **construction-documentation package contents** (drawing list, schedule, specification) | FAQ F14; Services page scope; case-study "documentation" claims. | Studio lead | OPEN | — |
| G2-3 | G2 service truth | Confirm the **revision / layout-option policy** (how many options, how many revision rounds, what counts as a scope change) | FAQ F11, F12; brief-form expectation-setting; contract page. | Studio lead + legal reviewer | OPEN | — |
| G2-4 | G2 service truth | Confirm **design-supervision (nadzór autorski) scope** — visits, reports, exclusions, and its legal separation from a construction manager | FAQ F26, F27; unlocks the P1 "design supervision" landing page (§17.2); appears in most project scopes already. | Studio lead + legal reviewer | OPEN | — |
| G2-5 | G2 service truth | Confirm the **procurement / purchasing role** — who orders, who handles complaints, and the supplier-commission/discount transparency policy | FAQ F22, F23, F24; required before any "we manage purchasing" claim. | Studio lead + legal/commercial reviewer | OPEN | — |
| G2-6 | G2 service truth | Confirm the **pricing-disclosure policy** — what (if anything) about fees may be published | FAQ F17, F44; §14.7 forbids inventing a universal rate. Blocks all cost content (B11 cost pillar). | Founders + studio lead | OPEN | — |
| G3-1 | G3 evidence rights | Confirm, **per project**, separate consent scopes for: portfolio use, plans/drawings, photography, client quotes, budgets, PR, social, and paid media | Blocks case studies (B06), press kits (B12), and any image schema (`ImageObject` rights metadata, §10). Rights are per-scope, not blanket. | Studio lead / data owner | OPEN | — |
| G3-2 | G3 evidence rights | Confirm **Dehesa** photography licence & release from Katarzyna Ramocka and Michał Woroniak (ZASOBY STUDIO) for press redistribution and high-res supply | Gates the Dehesa press kit send (B12) — see `press-kit-dehesa.*.md`. Credited but licence scope unknown. | Studio lead / PR | OPEN | — |
| G3-3 | G3 evidence rights | Confirm **collaborator credit approvals** (blsk.studio, Jord Studio, arch_it, BUCK.STUDIO, Michał Sokołowski) for any published case/press use | §12.2 acceptance criteria: collaborator credits must be approved before publication. | Studio lead / PR | OPEN | — |
| G4-1 | G4 analytics | Confirm the **qualified-lead definition** and CRM stages | Blocks B01, B02, the brief form (B05), and every conversion KPI. Nothing downstream can be measured without it. | Business owner + analytics/privacy owner | OPEN | — |
| G4-2 | G4 analytics | Confirm the **implementation-budget bands** to show in the brief form (§7.1 leaves them `[REQUIRES CONFIRMATION]`) | Blocks the budget field in B05 and FAQ cost framing. Must exclude the design fee if that is the approved model. | Business owner | OPEN | — |
| G4-3 | G4 analytics | Confirm the **response SLA** stated after brief submission (§7.2) | Published on the confirmation screen and used in review-workflow copy. Must not be invented. | Business owner + sales owner | OPEN | — |
| G4-4 | G4 analytics | Confirm **data retention, privacy/consent basis, and PII controls** for enquiry data | §7.3: no PII may reach GA4; consent must match the privacy notice. Blocks form go-live. | Analytics/privacy owner | OPEN | — |
| G4-5 | G4 analytics | Confirm the **consent-management / CMP tooling** for analytics (the site currently loads Vercel Analytics + Speed Insights with no visible CMP) | Consent basis and cookie policy must be settled before scaling any tracking (§7.3, §16.1). | Analytics/privacy owner | OPEN | — |
| G4-6 | G4 analytics | Confirm **accepted file types & size limits** for brief attachments (§7.1) | Needed before the upload control ships in B05. | Web/analytics + privacy owner | OPEN | — |
| G5-1 | G5 specialist claims | Name the **accessibility / neuroinclusion reviewer** required before any sensory-aware or ADHD-adjacent content is published | The Strachowicka and Gdańsk-library angles (§12.1) and FAQ F37 cannot be published as anything beyond design-intent without a named competent expert (§2.4, §3.3). Careful wording only — never a medical claim. | Relevant qualified expert | OPEN | — |
| G5-2 | G5 specialist claims | Name **conservation / historic-tenement reviewer** for Wrocław tenement and conservation-approval content | FAQ F41, F42; the P1 Wrocław/tenement pillar. | Relevant qualified expert | OPEN | — |
| G5-3 | G5 specialist claims | Name reviewers for any **structural, fire, sanitary (Sanepid), legal, or cost** assertions before they are published | llms.txt already claims "Sanepid support" — that claim needs a competent owner. Any cost model needs a reviewer (§2.4). | Relevant qualified experts | OPEN | — |
| G6-1 | G6 external change | Confirm **GBP ownership / claim status** and authorise profile edits (the repo only has a `maps.app.goo.gl` link — ownership unknown) | Blocks B07 (GBP completion) and the whole 90-day local plan (§9.2). No external edit without this. | Account/channel owner | OPEN | — |
| G6-2 | G6 external change | Confirm **Bing Places** ownership and authorise verification | Blocks the P1 "Bing Webmaster + Bing Places" work (§11.2, §17.2). | Account/channel owner | OPEN | — |
| G6-3 | G6 external change | **Decide the training-crawler policy.** The site's `robots.ts` currently returns allow-all (`User-agent: *, Allow: /`), so `GPTBot`, `Google-Extended`, `CCBot` etc. are **already permitted**. Confirm whether to keep, restrict, or split search vs training crawler access. | This is a *decision to confirm, not to change unilaterally* (§2.2 authority boundary; §11.2 keeps `Google-Extended` and `GPTBot` as separate policy choices). B10 must not alter crawler access without this sign-off. | Account/channel owner + security | OPEN | — |
| G6-4 | G6 external change | Authorise **press outreach** and the review-request program before either goes live | §9.1 / §12: outreach and review requests are external actions requiring owner approval; review requests must never offer incentives. | Account/channel owner | OPEN | — |

---

## Part B — FAQ answers requiring confirmation (§14)

Each of these FAQ answers is marked `[REQUIRES CONFIRMATION]` in the playbook and cannot be written until the underlying service truth is approved. Gate shown is the primary blocker (most sit behind **G2 service truth**; a few also need **G1** service-area or **G5** specialist review). Question text is quoted verbatim.

| ID | Gate | Question (decision needed) | Why it blocks / what it unlocks | Suggested approver | Status | Date |
|---|---|---|---|---|---|---|
| F04 | G2 / G0 | "Do you design individual rooms?" — confirm minimum scope and when a single-room job makes sense | Depends on G0-3 minimum scope. Unlocks a truthful FAQ + brief-form floor. | Studio lead | OPEN | — |
| F05 | G1 / G0 | "Do you work remotely outside Wrocław?" — confirm remote surveys, visits, supervision, and service area | Sets the published service-area policy (also feeds NAP & GBP areaServed). | Business owner | OPEN | — |
| F09 | G2 | "How long does an interior-design project take?" — confirm realistic ranges by area/scope/disciplines | Process pillar + FAQ; no universal promise allowed. | Studio lead | OPEN | — |
| F11 | G2 | "How many layout options will I receive?" — confirm option & iteration policy | See G2-3. | Studio lead | OPEN | — |
| F12 | G2 | "How many revision rounds are included?" — confirm limit, consolidated feedback, scope-change rule | See G2-3; also feeds the contract page. | Studio lead + legal | OPEN | — |
| F14 | G2 | "What does the construction-documentation package include?" — confirm the actual drawing/schedule/specification list | See G2-2. | Studio lead | OPEN | — |
| F15 | G2 | "Who coordinates specialist building systems?" — confirm boundaries between interior designer and specialist designers | Defines liability boundary in Services + supervision pages. | Studio lead + legal | OPEN | — |
| F16 | G2 | "How are decisions made when household members disagree?" — confirm the priorities-workshop / decision-criteria method | Process pillar; must reflect real method. | Studio lead | OPEN | — |
| F17 | G2 | "How much does an interior-design service cost?" — confirm pricing factors and scope | See G2-6; never invent one universal rate. | Founders + studio lead | OPEN | — |
| F21 | G2 | "Does the designer help control the budget?" — confirm estimates, alternatives, control points | Cost pillar; budget-control claim needs a real process behind it. | Studio lead | OPEN | — |
| F22 | G2 | "Will I receive a shopping list with prices?" — confirm specification scope, price validity, substitutes | See G2-5. | Studio lead | OPEN | — |
| F23 | G2 | "Does the studio receive supplier commissions?" — confirm the transparent discount/commission/remuneration policy | Trust-critical; see G2-5. | Founders + legal | OPEN | — |
| F24 | G2 | "Who places orders and handles complaints?" — confirm purchasing models and responsibility | See G2-5. | Studio lead + legal | OPEN | — |
| F25 | G2 | "Do you recommend renovation contractors you trust?" — confirm recommendation criteria, independence, separate contractor agreement | Liability & independence must be settled before publishing. | Studio lead + legal | OPEN | — |
| F26 | G2 | "Does the design include design supervision?" — confirm visits, reports, exclusions, and pricing | See G2-4; unlocks the supervision landing page. | Studio lead | OPEN | — |
| F30 | G2 | "Who inspects completed work?" — confirm partial inspections and party roles | Delivery-phase truth; role separation. | Studio lead + legal | OPEN | — |
| F32 | G2 | "Is support available after the project is complete?" — confirm as-built info, review visits, complaints handling | Enables the post-occupancy proof/case (P1, §17.2). | Studio lead | OPEN | — |
| F33 | G2 | "Do you help with developer-managed, buyer-requested pre-handover changes?" — confirm layout/systems/deadline analysis | Feeds the P1 purchaser-changes cluster (§17.2). | Studio lead | OPEN | — |
| F36 | G2 | "Do you design custom furniture?" — confirm drawing scope, maker relationship, prototypes, inspection | Scope is broadly true (most projects list furniture design) but the *depth* claims need confirming. | Studio lead | OPEN | — |
| F39 | G2 | "Do you help select art and collectible objects?" — confirm curation, display, lighting, safety, partner roles | New service territory; only publish if real. | Studio lead | OPEN | — |
| F40 | G2 | "Does the design include a terrace or entrance area?" — confirm the boundary between interior, architecture, and landscape | Scope-boundary clarity; avoids over-promising. | Studio lead | OPEN | — |
| F41 | G2 / G5 | "Do you undertake projects in historic Wrocław tenements?" — confirm diagnostics, formalities, conservation roles | Needs G5-2 conservation reviewer; unlocks the Wrocław/tenement pillar. | Studio lead + conservation expert | OPEN | — |
| F42 | G5 | "Do you assist with conservation approvals?" — confirm power of attorney, responsibility, specialist collaboration | Legal/conservation liability; needs a named expert. | Conservation/legal expert | OPEN | — |
| F44 | G2 | "How is a commercial-interior design fee calculated?" — confirm area/sector/timing/fit-out/approvals factors | See G2-6; commercial pricing framing. | Founders + studio lead | OPEN | — |
| F45 | G2 / G0 | "Do you design rental apartments and entire portfolios?" — confirm standard, target group, TCO, scaling | Depends on G0 fit; enables the investor cluster (K12). | Founders + studio lead | OPEN | — |
| F48 | G2 / G5 | "Do you work in commercial premises that remain operational?" — confirm phasing, health & safety, working hours, downtime | Needs H&S input; operational-fit-out claim. | Studio lead + specialist | OPEN | — |

---

**Related documents**

- `nap-source-of-truth.md` — resolves G1 facts already published vs. still missing.
- `backlog.md` — maps every gate above to the P0/P1/P2 item it blocks.
- Playbook §2.4 (gate table), §3 (truth set), §14 (full FAQ plan).
