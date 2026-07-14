# Off-site AI visibility — action list

Goal: when someone asks Claude, ChatGPT or Perplexity for "architekt wnętrz Wrocław" / "interior designer Warsaw", Kool Studio should be findable and citable. The on-site work (metadata, canonicals, crawlable nav/listing, JSON-LD, llms.txt) shipped in July 2026; everything below happens **outside the repo** and only the studio can do it (accounts, verification, outreach).

How the engines actually source local businesses (mid-2026):

- **Claude** searches through **Brave Search** (an Anthropic subprocessor; ~87% of Claude's citations overlap Brave's top organic results). Brave has its own independent index — being in Google does **not** mean being in Brave.
- **ChatGPT** pulls local business names primarily from **Foursquare** (OpenAI partnership since Dec 2024) and retrieves web content from **Bing's** index.
- **Perplexity** crawls with its own bot and weights **recency** and review/directory aggregators heavily.
- Across all engines, measured studies show **third-party mentions** (press, directories) predict AI citations far better than backlinks, and business listings account for ~40% of AI citations.

## 1. Search-index basics (do first, ~1 hour total)

- [ ] **Brave Search** — check coverage with `site:koolstudio.pl` at search.brave.com. Submit key URLs manually at https://search.brave.com/submit-url (homepage /pl and /en, /pl/projekty, /pl/oferta, /pl/studio, /pl/kontakt, top 3–4 project pages). Re-check in 30–60 days. *This is the single most direct lever for Claude.*
- [ ] **Bing Webmaster Tools** — https://www.bing.com/webmasters. Verify the domain (can import verification from Google Search Console), submit `https://koolstudio.pl/sitemap.xml`. Then watch the free **AI Performance** report (shows how often your pages are cited in Copilot/Bing AI answers). *This is the lever for ChatGPT's web retrieval.*
- [ ] **Google Search Console** — if not already verified, verify and submit the sitemap (also feeds Gemini/AI Overviews).

## 2. Business listings (the "entity" layer)

Keep NAP (name, address, phone) **byte-identical** everywhere: `Kool Studio, Zaporoska 83/15, 53-415 Wrocław` + hello@koolstudio.pl. Mention **both Wrocław (base) and Warsaw (service area)** in every description.

- [ ] **Google Business Profile** — a "kool studio" place already exists on Google Maps (the pin the site's kontakt page links to). Claim/verify it at https://business.google.com, set category *Architekt wnętrz / Interior designer*, add services, photos per project, website link, and Warsaw as a service area. Then **ask past clients for reviews that name the service and city** ("projekt wnętrza mieszkania we Wrocławiu") — review text gets quoted in AI answers.
- [ ] **Foursquare** — create/claim the listing at https://location.foursquare.com (or the Foursquare app), category Interior Designer / Design Studio, full NAP, description naming Wrocław + Warsaw, photos. *ChatGPT's primary local-name source; effect typically visible in 2–4 weeks.*
- [ ] **Bing Places** — https://www.bingplaces.com (can import from Google Business Profile).
- [ ] **Apple Business** — https://businessconnect.apple.com. Feeds Apple Maps, Siri and Apple Intelligence; most businesses still haven't claimed theirs, so it's cheap differentiation.

## 3. Industry directories & portfolio platforms

- [ ] **Homebook.pl professional profile** — the #1 Polish interiors directory with city-filtered "architekci / projektanci wnętrz" pages for Wrocław and Warszawa. Complete profile + upload the full portfolio with Polish descriptions. Also the pipeline into the annual **Homebook Design** album.
- [ ] **Archello** (free, self-publish) — https://archello.com — studio profile + all projects with **English** descriptions naming Wrocław and Warsaw. High-authority English source AI engines cite for "interior designer Poland/Warsaw".
- [ ] **Architonic** — firm profile, same English texts.
- [ ] **Houzz** (lower priority) — free profile, English + Polish description; skip paid tiers.

## 4. Press (the strongest measured signal)

Branded mentions in trusted media correlate ~3× stronger with AI-answer inclusion than backlinks. The studio already has Label Magazine, WhiteMAD and PLNdesign features — keep the loop running:

- [ ] For each completed project: professional photos + a short Polish press kit (story, city, metraż, materials, collaboration credits), pitched to **whitemad.pl, Label Magazine, Magazif, Domosfera, Czas na Wnętrze, Elle Decoration Polska**. Target 2–4 placements/year.
- [ ] Submit the annual **Homebook Design** album entry.
- [ ] For the strongest internationally photogenic project: **ArchDaily** (https://www.archdaily.com/submit-a-project — min. 15 photos at 2880px+, English narrative) and a **Dezeen** pitch. One acceptance = a permanent high-authority mention.
- [ ] Ask journalists to name the studio as "Kool Studio" **with city context** in the article body.

## 5. Social as an AI-crawlable surface

- [ ] **Instagram** — public/professional account; bio should read like an entity card: "Architektura wnętrz — Wrocław / Warszawa" + koolstudio.pl link. Write captions that name the **city and service in plain text** (Polish + one English line) — image-only posts are invisible to retrieval. Instagram is currently the #1 social source in ChatGPT answers.
- [ ] **Pinterest** — boards per project with descriptive titles/descriptions linking back to the koolstudio.pl project pages.

## 6. Later (after 2–3 press placements)

- [ ] **Wikidata item** for Kool Studio (instance of: interior design firm; HQ: Wrocław; official website; references: press URLs). Feeds Google's Knowledge Graph and LLM entity layers; typical knowledge-panel lag is 2–6 months.
- [ ] Add every claimed profile URL (Google Maps, Foursquare, Homebook, Archello, Architonic, Pinterest, Wikidata) to the site's JSON-LD `sameAs` array in `app/[locale]/layout.tsx` — currently it lists only Instagram.
- [ ] Consider the deferred **FAQ section** (oferta/kontakt) with FAQPage schema — FAQ + rich schema showed ~44% higher AI-citation rates; the questions people ask assistants are "ile kosztuje projekt wnętrz we Wrocławiu", "czy pracujecie w Warszawie", "jak długo trwa projekt".

## 7. Measure (monthly, 15 min)

- [ ] Ask Claude, ChatGPT and Perplexity (Polish + English): "architekt wnętrz Wrocław", "polecany projektant wnętrz Wrocław", "interior designer Warsaw Poland" — note whether Kool Studio appears and **which sources are cited**; put the next month's effort into whatever sources those are.
- [ ] Check Bing Webmaster **AI Performance** and `site:koolstudio.pl` on Brave.

### Notes

- `llms.txt` is now generated from `data/projects.ts` (correct founders, all projects, markdown links) — measured crawler adoption of llms.txt is near zero, so treat it as a zero-cost hedge, not a strategy. The crawlable HTML pages are what matter.
- The www→apex redirect is already configured (July 2026). Keep any future robots.txt `Disallow` rules in mind: the wildcard group applies to all AI crawlers.
