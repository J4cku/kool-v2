# Implementation Backlog — Status Board

**Purpose:** map the playbook's P0 backlog (**B01–B12**, §17.1) and P1/P2 items (§17.2) onto three buckets so it is always clear what can proceed now, what needs a person outside engineering, and what is hard-blocked by an unresolved decision:

- **(A) Implemented in this repo branch** — technical work being built on branch `claude/opus-report-delegation-hia53j`. These ship as *structure/scaffold*; they must not publish an unconfirmed business fact (see `decision-log.md`).
- **(B) Needs business action / account access** — requires an account, a login, a human decision, or an external relationship engineering cannot create.
- **(C) Blocked by gate** — cannot proceed at all until a `decision-log.md` gate (G0–G6) is resolved.

Most items appear in more than one bucket: the *scaffold* is in (A), while the *facts/content/accounts* that fill it sit in (B) or (C). The bucket tag on each item marks where its **critical path** currently sits.

**Acceptance criteria below are condensed from §17.1/§17.2. The authoritative versions are in the playbook.**

---

## Master map

| ID | Item | Critical-path bucket | Blocking gate(s) |
|---|---|---|---|
| B01 | Define ideal projects & qualified leads | C | G0, G4 |
| B02 | Connect GA4, GSC, Bing, CRM + event map | B | G4 |
| B03 | Audit indexing, IA, PL/EN, images | A | — (needs GSC access for full verification → B) |
| B04 | Services hub + four P0 landing pages | A (scaffold) / C (copy) | G0, G2 |
| B05 | Project-brief form + confirmations | A (scaffold) / C (bands, SLA) | G4 |
| B06 | Eight evidence-standard case studies | A (structure) / C (rights, facts) | G3 |
| B07 | Complete & reconcile Google Business Profile | B | G1, G6 |
| B08 | Review request/reply program | B | G4, G6 |
| B09 | Entity graph (business, people, services, pages) | A | G1, G2 (facts) |
| B10 | Configure robots/WAF for legit crawlers | A (code) / C (policy) | G6 |
| B11 | Three pillars: process, cost, studio choice | A (structure) / C (facts) | G2 |
| B12 | Dehesa press kit + tailored pitch | A (draft done) / C (rights) | G3, G6 |
| P1 | Interior-modernisation landing page | C | G0, G2 |
| P1 | Design-supervision landing page | C | G2 |
| P1 | Purchaser-changes cluster | C | G2 |
| P1 | Wrocław/tenement pillar | C | G2, G5 |
| P1 | Bing Webmaster + IndexNow | B | G6 |
| P1 | Quarterly AI audit | A (kit done) / B (runs) | — |
| P1 | Two additional press kits | C | G3 |
| P1 | Post-occupancy case study (12–24 mo) | C | G3 |
| P2 | Original report / detail atlas | C | G3, G5 |
| P2 | Budget calculator | C | G2 |
| P2 | Neuroinclusive content | C | G5 |
| P2 | Expand English content | B | G0 |

---

## Bucket A — Implemented in this repo branch (`claude/opus-report-delegation-hia53j`)

These deliverables are built now as engineering artefacts. They are **index-eligible structure with placeholder/confirmed-only facts** — every business fact stays gated until `decision-log.md` clears it. The branch keeps existing crawlability invariants (nav links in server HTML; server-rendered projects grid).

| ID | What is being built on this branch | Condensed acceptance criteria (§17.1) | Fact dependency |
|---|---|---|---|
| **B03** | **Technical-SEO audit + fixes.** Indexing/canonical audit, sitemap correctness, crawlable HTML links, PL/EN pairing (`hreflang`, `x-default`), semantic image alts/dimensions. Repo already ships `app/sitemap.ts`, `app/robots.ts`, per-page canonicals via `pageMetadata`. | Prioritised issue register closed or accepted; priority URLs index-eligible with correct canonical/language/image signals; no non-indexable priority URL, canonical conflict, redirect loop, or broken PL/EN pair. | Full verification needs **GSC/Bing access (B)**; on-page fixes proceed now. |
| **B04** | **Services hub + four P0 landing-page shells.** Route + reusable service-page template (`components/oferta/…` pattern) for: apartment design, house design, commercial interiors, + one more per G0. Crawlable, internally linked, with CTA slot to the brief form. **Copy is placeholder** until service truth is approved. | Crawlable, index-eligible, measured, reviewed URLs; each page has an approved *real* offer + proof before it publishes real copy (§B04 stop condition). | Real service copy **blocked by G0 (which four) + G2 (scope truth)** → Bucket C. |
| **B05** | **Project-brief form + confirmation scaffold.** Accessible form (visible labels, keyboard order, error recovery, file-size limits shown), server-side success as the `brief_submit` source with non-identifying `event_id`, confirmation screen, alternative email path. Fields per §7.1. | Accessible, tested; valid submissions reach CRM once; confirmation works; no PII to GA4; duplicate events prevented. | Budget **bands, response SLA, retention, CMP, file limits blocked by G4** → Bucket C; CRM endpoint needs **B02 (B)**. |
| **B06** | **Case-study structure/template.** Templates A/B/C (§15) wired to `data/projects.ts` (`Project` type already carries scope, area, year, credits, description blocks, before/after sliders). Problem→decision→result skeleton + service-link + CTA slots. | Each case has scope, problem, decisions, evidence, service link, CTA; no outcome inferred from images. | Per-project **rights + verified facts blocked by G3** → Bucket C. Structure ships now. |
| **B09** | **Entity graph.** Extend the existing JSON-LD (currently `ProfessionalService` in `layout.tsx`, `CreativeWork` + `BreadcrumbList` per project) into a stable `@id` graph for org, people, services, pages (§10.2). Migrate the deprecated `ProfessionalService` → `Organization`/`LocalBusiness`. | Validator passes; visible facts match JSON-LD; one stable `@id` per entity; no duplicate nodes; URL Inspection recorded. | `LocalBusiness` vs `Organization`, legal name, founders, phone/hours **blocked by G1/G1-3**; service nodes need **G2**. |
| **B10** | **robots/WAF config for legitimate crawlers.** Keep search/AI crawler access working; separate *search* access from *training-crawler* policy in code so the decision is switchable. Current `robots.ts` is allow-all. | Logs confirm approved access; training-crawler decisions kept separate; no security/performance harm. | The **policy itself is a G6 decision** (do not change unilaterally) → Bucket C. |
| **B11** | **Pillar page structure** for process / cost / studio-choice (§13). Routes, headings, internal-link scaffolding, author + review-date slots, measured CTA. | Quality ≥16/20; original proof; measured CTA; named maintenance owner. | Real process/cost facts **blocked by G2**; cost claims need a **G5 reviewer** → Bucket C. |
| **B12** | **Dehesa press kit (draft).** ✅ Delivered as `press-kit-dehesa.pl.md` + `.en.md` (this folder): 760-word PL/EN descriptions, 120-word summary, data sheet, image inventory, bio, links, 10-outlet `[PROPOSED]` list. | Complete kit + 10 individually selected, recorded pitches. | Send **blocked by G3 (rights) + G6 (outreach approval)** → Bucket C. |
| **P1 · AI audit** | **Quarterly AI-audit kit.** ✅ Delivered as `ai-audit-prompts.md`: 30 PL + 10 EN fixed prompts, protocol, coding scheme, scoring template, targets. | Reproducible report; consistent method; output order never treated as rank. | Actually **running** it each quarter = Bucket B (Marketing). |
| **Ops docs** | **This documentation set.** `decision-log.md`, `nap-source-of-truth.md`, `ai-audit-prompts.md`, `press-kit-dehesa.*.md`, `backlog.md`. | Every gate/fact has an owner, deliverable, dependency, acceptance evidence, review date, stop condition (§17.3). | — |

> **Analytics scaffold note:** the site already loads Vercel Web Analytics + Speed Insights (`layout.tsx`). The *event map* and GA4/GSC/Bing/CRM wiring (B02) is **not** something engineering can finish alone — it needs property access and a consent/CMP decision (Bucket B + gate G4).

---

## Bucket B — Needs business action / account access

Engineering cannot create these; they need a login, an account claim, a human relationship, or an owner decision.

| ID | Item | Who acts | Condensed acceptance criteria | Gate ref |
|---|---|---|---|---|
| **B02** | Connect **GA4, GSC, Bing Webmaster, CRM** + wire the event map | Analytics/CRM owner | End-to-end tested; dashboard receives deduplicated data; every contact route has source/landing/status/outcome. | G4 (`decision-log` G4-1/4/5) |
| **B07** | Claim & complete **Google Business Profile**; reconcile NAP | Local owner | Approved settings sheet, rights-cleared media (20–30 launch images), tagged landing link with UTM; NAP matches `nap-source-of-truth.md`. | G1 (name/address/phone/hours), G6-1 (ownership + category) |
| **B08** | **Review request/reply program** | Studio/sales | Neutral workflow, three milestone templates, response SLA ≤5 business days, owner; **no incentives**, no gating. | G4 (CRM milestones), G6-4 (authorise) |
| **P1 · Bing** | **Bing Webmaster + IndexNow** | Dev + account owner | Verification + URL tests; submit sitemap; pause while URL errors remain. | G6-2 (Bing Places ownership) |
| **P1 · AI audit runs** | Execute the quarterly audit using the kit | Marketing | Run on ChatGPT/Gemini/Perplexity in clean sessions; record evidence; code answers. | — (kit ready) |
| **P2 · English** | Expand English content | Marketing | Only key useful URLs; stop without international pipeline/PR. | Prioritise per G0 |

---

## Bucket C — Blocked by gate (cannot proceed until decision recorded)

Each row is hard-blocked. Resolve the gate in `decision-log.md`, then the paired Bucket-A scaffold can be filled and shipped.

| ID | Item | Condensed acceptance criteria | Blocking gate → decision-log ref |
|---|---|---|---|
| **B01** | Define ideal projects & qualified-lead criteria | Approved fit criteria, exclusions, reason codes. **Foundational — unblocks B04/B05 targeting and all measurement.** | **G0** (G0-1..4) + **G4** (G4-1) |
| **B04** | Real Services-hub + landing-page copy | Approved real offer + proof per page before publish. | **G0** (which 3–4), **G2** (scope truth) |
| **B05** | Brief-form business logic (budget bands, SLA, retention, consent) | Bands/SLA/retention/CMP/file-limits confirmed; consent matches privacy notice. | **G4** (G4-2..6) |
| **B06** | Case-study *content* (per project) | Verified problem/decision/result + rights + no private data. | **G3** (G3-1; Dehesa G3-2) |
| **B10** | Training-crawler / WAF *policy* | Approved crawler-access policy; search vs training separated. | **G6-3** (confirm, don't change unilaterally) |
| **B11** | Pillar *content* (process, cost, studio-choice) | Original first-hand proof; cost claims reviewed. | **G2** (all), **G5** (cost/specialist) |
| **P1** | Interior-modernisation landing page | Demonstrated demand + two proofs + approved offer; revise/stop after two quarters without qualified assistance. | **G0**, **G2** |
| **P1** | Design-supervision landing page | Reviewed role + scope + FAQ + proof; stop if no real offer/capacity. | **G2** (G2-4; FAQ F26/F27) |
| **P1** | Purchaser-changes cluster | Pillar + three supporting items; merge on cannibalisation. | **G2** (FAQ F33) |
| **P1** | Wrocław/tenement pillar | Pillar + case with ≥2 real regional facts; stop without genuine local value. | **G2**, **G5-2** (conservation) |
| **P1** | Two additional press kits | Two complete kits + tailored pitch with true PL/EN material; stop without rights. | **G3** |
| **P1** | Post-occupancy case study (12–24 mo) | Published post-occupancy evidence; stop without evaluation. | **G3** (consent) |
| **P2** | Original report / detail atlas | Unique data + defensible method + privacy + reviewer; stop if generic/unsafe. | **G3**, **G5** |
| **P2** | Budget calculator | Approved model + volatile-data owner + update capacity; stop if it can't stay current. | **G2** (pricing model) |
| **P2** | Neuroinclusive content | Competent expert + client consent + careful terminology + demand; stop without competence/consent. | **G5-1** (never a medical claim) |

---

## Sequencing reminder (§17.1 dependency order)

1. **B01** unlocks qualification, page targeting, form bands, measurement — do this first.
2. **B02** starts before publication so the baseline is trustworthy.
3. **B03** defines migration/template work before new architecture ships.
4. **B04 + B05** share service-truth, UI, accessibility, analytics dependencies.
5. **B06** supplies proof for B04/PR; publish landing pages in stages if proof isn't ready.
6. **B07/B08** can start early once G1/G4/G6 clear.
7. **B09** follows confirmed entities + stable templates.
8. **B10** follows security review + official crawler docs + the G6-3 policy decision.
9. **B11** follows IA + proof workflow.
10. **B12** follows rights clearance — never pitch a non-exclusive asset as exclusive.

**Governance (§17.3):** every item needs one accountable human, a deliverable, a dependency list, acceptance evidence, a metric, a review date, and a stop condition. P1/P2 must not bypass unresolved P0 data-quality, service-truth, rights, or crawlability failures.

**Related:** `decision-log.md` (gates), `nap-source-of-truth.md` (G1 facts), `ai-audit-prompts.md`, `press-kit-dehesa.*.md`.
