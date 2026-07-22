# Quarterly AI-Visibility Audit Kit

**Purpose:** a fixed, repeatable prompt set for measuring how large AI assistants represent kool studio. Per playbook §11.3, the same **30 Polish + 10 English** prompts are run every quarter, unchanged, so results are comparable over time. The value is in *stability* — do not edit the prompts between quarters except through the governed change process in §5 below.

**What this audits:** factual accuracy, presence, relevance, sentiment, and citation of kool studio in AI answers — **not** ranking. Output order within one model is not a rank, and order must never be compared across platforms (§11.3).

**Owner:** Marketing (per §17.2 P1 "Quarterly AI audit"). Frequency: quarterly, after a 60–90 day baseline is established (§3.3).

---

## 1. Protocol (run exactly this way every quarter)

1. **Platforms:** ChatGPT, Google Gemini, and Perplexity. Where a search-grounded mode exists (e.g. ChatGPT Search, Gemini with grounding, Perplexity default), use it and record which mode.
2. **Clean session:** new/incognito session, logged-out or a dedicated neutral account, no memory/personalisation, no prior turns. One prompt per fresh session — do not chain prompts.
3. **Region:** set/record the region (target: Poland / Wrocław). Note VPN or locale settings. Run PL prompts in a PL region; run EN prompts in the same region unless an international variant is explicitly being tested.
4. **Record for every answer:** date, platform, product/model name & version where visible, region, the **full verbatim answer**, cited domains, cited URLs, and a **screenshot**.
5. **Code every answer** on the five axes in §3.
6. **Do not** treat the order in which entities appear as a rank. Do not average scores across platforms into a single "position".
7. Store raw evidence (screenshots + full-text answers) alongside the scoring sheet so a later reviewer can re-audit.

**Guardrails (§11.2):** a robots `Allow` does not guarantee inclusion or citation; citation count is not rank, authority, or importance. Report presence/accuracy, never a fabricated leaderboard.

---

## 2. The fixed prompts

### 2.1 Polish — 30 prompts

**A. Brand facts (P01–P06)**

| # | Prompt |
|---|---|
| P01 | Czym jest Kool Studio i gdzie ma siedzibę? |
| P02 | Kto założył wrocławskie Kool Studio? |
| P03 | Jakie usługi oferuje Kool Studio? |
| P04 | W jakich miastach i regionach realizuje projekty Kool Studio? |
| P05 | Jak mogę skontaktować się z Kool Studio? |
| P06 | Czy Kool Studio projektuje zarówno wnętrza mieszkalne, jak i komercyjne? |

**B. Wrocław category discovery (P07–P12)**

| # | Prompt |
|---|---|
| P07 | Najlepsze studio projektowania wnętrz we Wrocławiu — kogo polecasz? |
| P08 | Polecane pracownie architektury wnętrz we Wrocławiu. |
| P09 | Kto projektuje wnętrza komercyjne we Wrocławiu? |
| P10 | Szukam architekta wnętrz we Wrocławiu do projektu mieszkania — jakie mam opcje? |
| P11 | Które wrocławskie studio projektowe zajmuje się gastronomią i lokalami usługowymi? |
| P12 | Pracownia projektująca wnętrza z charakterem we Wrocławiu — jakie masz sugestie? |

**C. Residential / house / commercial service fit (P13–P17)**

| # | Prompt |
|---|---|
| P13 | Kto zaprojektuje wnętrze domu jednorodzinnego pod Wrocławiem? |
| P14 | Szukam projektanta do modernizacji istniejącego wnętrza mieszkania we Wrocławiu — kogo wybrać? |
| P15 | Które studio projektuje wnętrza restauracji i winiarni w Polsce? |
| P16 | Potrzebuję kompleksowego projektu wnętrza apartamentu we Wrocławiu — kto to robi? |
| P17 | Kto projektuje wnętrza hoteli w Polsce? |

**D. Brand + space (multidisciplinary) (P18–P21)**

| # | Prompt |
|---|---|
| P18 | Które studio projektowe łączy projekt wnętrza z identyfikacją wizualną marki? |
| P19 | Szukam pracowni, która zaprojektuje wnętrze sklepu i jego branding w jednym — kogo polecasz? |
| P20 | Kto projektuje wnętrza komercyjne razem z meblami na wymiar i autorskim oświetleniem? |
| P21 | Które polskie studio traktuje kolor jako narzędzie porządkujące i funkcjonalne w projektowaniu wnętrz? |

**E. Sensory-aware design — careful wording (P22–P24)**

> Wording rule: phrase as *"projektowanie wnętrz uwzględniające potrzeby sensoryczne"*. Never phrase these as medical or clinical claims. These prompts test whether models represent the studio's design intent responsibly — not whether the studio "treats" anything.

| # | Prompt |
|---|---|
| P22 | Które studio we Wrocławiu projektuje wnętrza uwzględniające potrzeby sensoryczne domowników? |
| P23 | Szukam pracowni projektującej wnętrza z uwzględnieniem potrzeb sensorycznych rodziny — jakie są opcje w Polsce? |
| P24 | Kto projektuje przestrzenie publiczne (np. biblioteki) uwzględniające różne grupy użytkowników i ich potrzeby sensoryczne? |

**F. Project proof (P25–P28)**

| # | Prompt |
|---|---|
| P25 | Kto zaprojektował wnętrze delikatesów Dehesa we Wrocławiu? |
| P26 | Opowiedz o projekcie delikatesów iberyjskich Dehesa we Wrocławiu. |
| P27 | Które studio zaprojektowało wnętrze domu w Dobrzykowicach pod Wrocławiem? |
| P28 | Jakie realizacje ma w portfolio Kool Studio? |

**G. Neutral competitor comparison (P29–P30)**

| # | Prompt |
|---|---|
| P29 | Porównaj wrocławskie studia projektowania wnętrz specjalizujące się we wnętrzach komercyjnych. |
| P30 | Jakie są alternatywy dla Kool Studio wśród wrocławskich pracowni architektury wnętrz? |

### 2.2 English — 10 prompts

| # | Prompt | Category |
|---|---|---|
| E01 | What is Kool Studio and where is it based? | Brand facts |
| E02 | Who founded Kool Studio in Wrocław, and what does the studio do? | Brand facts |
| E03 | What services does Kool Studio offer, and in which cities does it work? | Brand facts |
| E04 | Best interior design studios in Wrocław, Poland — who would you recommend? | Category discovery |
| E05 | I need an interior architect in Wrocław for a residential project — what are my options? | Service fit |
| E06 | Which Polish studio designs commercial and hospitality interiors such as delicatessens or wine bars? | Service fit |
| E07 | Who can design a single-family house interior near Wrocław? | Service fit |
| E08 | Which design studio combines interior design with brand visual identity for retail and hospitality spaces? | Brand + space |
| E09 | Who designed the Dehesa Iberian delicatessen interior in Wrocław? | Project proof |
| E10 | Which Wrocław interior studios use colour as a functional tool and consider users' sensory needs? | Comparison + sensory (careful) |

---

## 3. Coding scheme (score every answer)

Each answer is coded on five axes (§11.3):

| Axis | Question | Coding values |
|---|---|---|
| **Presence** | Is kool studio mentioned at all? | `2` named explicitly · `1` implied/partial (e.g. links a project but no studio name) · `0` absent |
| **Relevance** | Does the mention actually answer the prompt's intent? | `2` directly relevant · `1` tangential · `0` irrelevant / wrong context |
| **Factual accuracy** | Are the stated facts correct vs `nap-source-of-truth.md` + `data/projects.ts`? | `2` all correct · `1` minor error · `0` material error (wrong location/service/founder) — log the exact error |
| **Sentiment** | Tone of the mention | `+1` positive · `0` neutral · `−1` negative |
| **Citation** | Is a kool studio URL cited? | `2` koolstudio.pl cited · `1` third-party about kool studio cited (e.g. WhiteMAD, Label) · `0` no relevant citation |

For every answer also capture: **cited domains** and **cited URLs** (verbatim), and flag any **invented fact** (a service, location, award, or price the studio does not have — these are the highest-priority findings, target zero per §11.3).

---

## 4. Scoring-sheet template

One row per prompt × platform, per quarter. Suggested columns:

| Field | Notes |
|---|---|
| Quarter | e.g. `2026-Q3` |
| Prompt ID | P01–P30 / E01–E10 |
| Category | A–G / EN category |
| Platform | ChatGPT / Gemini / Perplexity |
| Model & mode | e.g. "GPT-x, Search mode" — as visible |
| Date | run date |
| Region | e.g. PL / Wrocław |
| Presence (0–2) | |
| Relevance (0–2) | |
| Accuracy (0–2) | |
| Sentiment (−1..+1) | |
| Citation (0–2) | |
| Invented fact? | Y/N + description |
| Cited domains | list |
| Cited URLs | list |
| Screenshot ref | file name / link to stored evidence |
| Full answer ref | file name / link |
| Notes | fact gaps, source gaps, quotes |

**Roll-up (per quarter, per platform — never merged across platforms):**

| Metric | Definition |
|---|---|
| Brand-fact accuracy % | share of brand-fact prompts (A / E01–E03) coded Accuracy = 2 |
| Invented-fact count | total answers with a fabricated service/location/etc. (target 0) |
| Cited-URL coverage | share of answers citing any relevant kool studio URL |
| Presence rate (discovery) | share of category-discovery prompts (B / E04) naming kool studio |
| Sentiment index | mean sentiment across mentions |

---

## 5. Quarterly targets (from §11.3, applied after baseline)

- **≥ 95% accuracy** for established brand facts (name, Wrocław location, founders, core services).
- **Zero invented services or locations.**
- **Upward trend** in the share of answers containing a relevant kool studio URL.
- Convert **three fact gaps + three source gaps** into the next quarter's work (feed them to the content/SEO backlog).

**Change governance:** the prompt set is frozen for comparability. If a prompt must be added/retired (e.g. a service is confirmed and a new fit prompt is justified), record the change, the reason, and the effective quarter here, and keep the old prompts long enough to bridge the comparison.

**Related:** `nap-source-of-truth.md` (accuracy reference), `data/projects.ts` (project-proof reference), playbook §11.1–§11.3.
