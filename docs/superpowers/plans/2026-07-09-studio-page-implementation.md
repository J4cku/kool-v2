# Studio Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current localized Studio placeholder with the approved responsive PDF layout, supplied imagery, linked press coverage, and Polish/English content.

**Architecture:** Keep the feature page-scoped in the existing `app/[locale]/studio/page.tsx` route. Store all public copy in the existing `studio` message namespace, keep fixed publication metadata as a typed local array, and serve optimized supplied assets from `public/images/studio/` through `next/image`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, next-intl 4, Tailwind CSS 4, next/image, pnpm.

## Client-Approved Revision (Supersedes Task 3 Hero and Manifesto Direction)

Client review supersedes the static inline 16:9 hero and static manifesto described in Task 3. The Studio route must reuse `ProjectHero` with `/images/studio/team.webp`, render an `h-screen` spacer, and place all beige content plus `FooterBanner showMarquee={false}` inside a `relative z-10 bg-beige` wrapper. Replace the static manifesto heading with the existing homepage `animate-marquee` pattern: four repeated copies in one semantic `h1`, with only the first copy exposed to assistive technology. The localized press-section heading uses Poppins font weight `700`, explicitly superseding the older Task 3 sample's `font-[900]`; publication-card heading weights do not change. The intro, press header layout, links, and responsive 1/2/3-column grid remain unchanged.

Revision acceptance contract:

```bash
node -e "const fs=require('fs'); const source=fs.readFileSync('app/[locale]/studio/page.tsx','utf8'); for (const value of ['ProjectHero','className=\"h-screen\"','animate-marquee']) { if (!source.includes(value)) throw new Error('missing '+value); } if (source.includes('aspect-video')) throw new Error('inline hero remains');"
pnpm typecheck
pnpm exec eslint 'app/[locale]/studio/page.tsx'
pnpm check:i18n
pnpm check
git diff --check
```

The revision is authoritative wherever the original Task 3 code sample or static-hero/static-manifesto language conflicts with it.

## Global Constraints

- Work in `/Users/jacek/conductor/workspaces/kool-v2/tianjin-v1` on the existing branch; do not rename it.
- Reuse `Navbar`, `FooterBanner`, `useTranslations`, and the current Tailwind tokens.
- Use only Poppins and the existing palette: beige `#E5DDD0`, coral `#FC3117`, dark `#1A1A1A`, muted `#888888`, and white `#FFFFFF`.
- Do not change `app/globals.css`, shared navigation, shared footer, sitemap behavior, dependencies, or unrelated routes.
- Use the supplied assets from `.context/design/studio/assets/`; do not substitute existing project photography.
- Polish copy follows the supplied PDF. English press titles are translated and end in `[PL]`.
- Publication links open in a new tab with `rel="noopener noreferrer"`.
- Internal navigation remains locale-aware through `@/i18n/navigation`; this page introduces no internal links.
- Run `pnpm check` and the repository `verify-site` workflow before handoff.

---

### Task 1: Publish the Approved Studio Assets

**Files:**
- Create: `public/images/studio/team.webp`
- Create: `public/images/studio/studio-detail.webp`
- Create: `public/images/studio/press-label-dehesa.webp`
- Create: `public/images/studio/press-whitemad-dehesa.webp`
- Create: `public/images/studio/press-label-guide.webp`
- Create: `public/images/studio/press-plndesign-kancelaria.webp`
- Create: `public/images/studio/logo-label.png`
- Create: `public/images/studio/logo-whitemad.png`
- Create: `public/images/studio/logo-plndesign.png`

**Interfaces:**
- Consumes: Final assets extracted to `.context/design/studio/assets/`.
- Produces: Stable public paths consumed by `app/[locale]/studio/page.tsx` in Task 3.

- [ ] **Step 1: Verify the expected source assets exist**

Run:

```bash
for file in \
  KOOL_studio_main.webp \
  KOOL_studio_small.webp \
  KOOL_press_dehesa_label.webp \
  KOOL_press_dehesa_whitemad.webp \
  KOOL_press_dehesa_label_przewodnik.webp \
  KOOL_press_kancelaria_plndesign.webp \
  logotyp_label.png \
  logotyp_whitemad.png \
  logotyp_plndesign.png; do
  test -f ".context/design/studio/assets/$file" || exit 1
done
```

Expected: exit code 0 and no output.

- [ ] **Step 2: Copy the assets to stable public paths**

Run:

```bash
mkdir -p public/images/studio
cp .context/design/studio/assets/KOOL_studio_main.webp public/images/studio/team.webp
cp .context/design/studio/assets/KOOL_studio_small.webp public/images/studio/studio-detail.webp
cp .context/design/studio/assets/KOOL_press_dehesa_label.webp public/images/studio/press-label-dehesa.webp
cp .context/design/studio/assets/KOOL_press_dehesa_whitemad.webp public/images/studio/press-whitemad-dehesa.webp
cp .context/design/studio/assets/KOOL_press_dehesa_label_przewodnik.webp public/images/studio/press-label-guide.webp
cp .context/design/studio/assets/KOOL_press_kancelaria_plndesign.webp public/images/studio/press-plndesign-kancelaria.webp
cp .context/design/studio/assets/logotyp_label.png public/images/studio/logo-label.png
cp .context/design/studio/assets/logotyp_whitemad.png public/images/studio/logo-whitemad.png
cp .context/design/studio/assets/logotyp_plndesign.png public/images/studio/logo-plndesign.png
```

Expected: nine files created under `public/images/studio/`.

- [ ] **Step 3: Verify file count and dimensions**

Run:

```bash
test "$(find public/images/studio -type f | wc -l | tr -d ' ')" = "9"
for file in public/images/studio/*; do
  sips -g pixelWidth -g pixelHeight "$file" 2>/dev/null
done
```

Expected: exit code 0; team `2560x1440`, detail `1000x1500`, all four press images `1440x1440`, and all three logos report non-zero dimensions.

- [ ] **Step 4: Commit the asset set**

```bash
git add public/images/studio
git commit -m "Add Studio page assets"
```

Expected: one commit containing only the nine public assets.

---

### Task 2: Replace Placeholder Studio Translations

**Files:**
- Modify: `messages/pl.json` (`studio` object)
- Modify: `messages/en.json` (`studio` object)

**Interfaces:**
- Consumes: Existing `studio` next-intl namespace.
- Produces: `studio.manifesto`, `studio.intro`, `studio.heroImageAlt`, `studio.detailImageAlt`, `studio.pressHeading`, and `studio.press.items.<key>.{title,imageAlt}` for Task 3.

- [ ] **Step 1: Run a failing localization contract check**

Run:

```bash
node -e "const fs=require('fs'); for (const locale of ['pl','en']) { const s=JSON.parse(fs.readFileSync('messages/'+locale+'.json','utf8')).studio; for (const key of ['manifesto','intro','pressHeading','press']) { if (!(key in s)) throw new Error(locale+': missing studio.'+key); } }"
```

Expected: FAIL with `pl: missing studio.manifesto` because the placeholder schema is still present.

- [ ] **Step 2: Replace the Polish `studio` object**

Replace only the current top-level `studio` object in `messages/pl.json` with:

```json
"studio": {
  "title": "Studio",
  "manifesto": "WE ARE KOOL AND WE DESIGN KOOL THINGS!",
  "intro": "to wrocławskie studio projektowe założone przez dynamiczny duet architektek – Olę Kilińską i Olę Leszczyńską. Tworzymy wyjątkowe wnętrza i przestrzenie komercyjne, które są równie funkcjonalne, co inspirujące. Łącząc różne dyscypliny, od projektowania wnętrz i strategii, po rozwój produktu i identyfikację wizualną, tworzymy koncepcje, które włączą praktyczność z pięknem. Nasze przestrzenie nie tylko działają – one rezonują, wywołują emocje i pozostawiają trwałe wrażenie.",
  "heroImageAlt": "Ola Kilińska i Ola Leszczyńska w pracowni Kool Studio",
  "detailImageAlt": "Materiały i próbki w pracowni Kool Studio",
  "pressHeading": "Napisali o nas",
  "press": {
    "items": {
      "labelDehesa": {
        "title": "Delikatesy iberyjskie we Wrocławiu. Wypełniły je kolory jak z filmów Almodovara",
        "imageAlt": "Burgundowe wnętrze delikatesów Dehesa"
      },
      "whitemadDehesa": {
        "title": "Delikatesy we Wrocławiu inspirowane kolorami Hiszpanii",
        "imageAlt": "Lada i czerwone lampy w delikatesach Dehesa"
      },
      "labelGuide": {
        "title": "Polska. Miejski przewodnik",
        "imageAlt": "Okładka książki Polska. Miejski przewodnik"
      },
      "plndesignOffice": {
        "title": "Architektki urządziły kancelarię na 19 m² we Wrocławiu",
        "imageAlt": "Wnętrze małej kancelarii we Wrocławiu"
      }
    }
  }
}
```

- [ ] **Step 3: Run i18n parity to observe the red state**

Run:

```bash
pnpm check:i18n
```

Expected: FAIL because the Polish and English Studio key trees differ.

- [ ] **Step 4: Replace the English `studio` object**

Replace only the current top-level `studio` object in `messages/en.json` with:

```json
"studio": {
  "title": "Studio",
  "manifesto": "WE ARE KOOL AND WE DESIGN KOOL THINGS!",
  "intro": "Kool is a Wrocław-based design studio founded by the dynamic architect duo Ola Kilińska and Ola Leszczyńska. We create distinctive interiors and commercial spaces that are as functional as they are inspiring. Combining disciplines from interior design and strategy to product development and visual identity, we create concepts that unite practicality with beauty. Our spaces do more than work – they resonate, evoke emotion, and leave a lasting impression.",
  "heroImageAlt": "Ola Kilińska and Ola Leszczyńska in the Kool Studio workspace",
  "detailImageAlt": "Materials and samples in the Kool Studio workspace",
  "pressHeading": "Featured in",
  "press": {
    "items": {
      "labelDehesa": {
        "title": "An Iberian delicatessen in Wrocław, filled with colours straight out of Almodóvar's films [PL]",
        "imageAlt": "Burgundy interior of the Dehesa delicatessen"
      },
      "whitemadDehesa": {
        "title": "A delicatessen in Wrocław inspired by the colours of Spain [PL]",
        "imageAlt": "Counter and red lights in the Dehesa delicatessen"
      },
      "labelGuide": {
        "title": "Poland. City Guide [PL]",
        "imageAlt": "Cover of the Poland. City Guide book"
      },
      "plndesignOffice": {
        "title": "Architects designed a 19 m² law office in Wrocław [PL]",
        "imageAlt": "Interior of a small law office in Wrocław"
      }
    }
  }
}
```

- [ ] **Step 5: Run the localization contract and parity checks**

Run:

```bash
node -e "const fs=require('fs'); for (const locale of ['pl','en']) { const s=JSON.parse(fs.readFileSync('messages/'+locale+'.json','utf8')).studio; for (const key of ['manifesto','intro','pressHeading','press']) { if (!(key in s)) throw new Error(locale+': missing studio.'+key); } }"
pnpm check:i18n
```

Expected: both commands exit 0; i18n parity prints its success message.

- [ ] **Step 6: Commit the localized content**

```bash
git add messages/pl.json messages/en.json
git commit -m "Add localized Studio page content"
```

Expected: one commit containing only the two message files.

---

### Task 3: Replace the Studio Route with the Approved Layout

**Files:**
- Modify: `app/[locale]/studio/page.tsx` (replace entire file)

**Interfaces:**
- Consumes: Public image paths from Task 1 and `studio` translation keys from Task 2.
- Produces: Responsive Studio page at `/pl/studio` and `/en/studio` with four external publication links.

- [ ] **Step 1: Run a failing source-level acceptance check**

Run:

```bash
node -e "const fs=require('fs'); const source=fs.readFileSync('app/[locale]/studio/page.tsx','utf8'); for (const value of ['/images/studio/team.webp','label-magazine.com/wnetrza/artykuly','whitemad.pl/delikatesy-we-wroclawiu-dehesa','plndesign.pl/wnetrza']) { if (!source.includes(value)) throw new Error('missing '+value); }"
```

Expected: FAIL with `missing /images/studio/team.webp` because the placeholder route uses unrelated project images.

- [ ] **Step 2: Replace the route implementation**

Replace `app/[locale]/studio/page.tsx` with:

```tsx
'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import FooterBanner from '@/components/FooterBanner';
import Navbar from '@/components/Navbar';

type PressItemKey =
  | 'labelDehesa'
  | 'whitemadDehesa'
  | 'labelGuide'
  | 'plndesignOffice';

type PressItem = {
  key: PressItemKey;
  publication: string;
  href: string;
  image: string;
};

const pressItems: PressItem[] = [
  {
    key: 'labelDehesa',
    publication: 'Label Magazine',
    href: 'https://label-magazine.com/wnetrza/artykuly/delikatesy-iberyjskie-we-wroclawiu-wypelnily-je-kolory-jak-z-filmow-almodovara',
    image: '/images/studio/press-label-dehesa.webp',
  },
  {
    key: 'whitemadDehesa',
    publication: 'WhiteMAD',
    href: 'https://www.whitemad.pl/delikatesy-we-wroclawiu-dehesa/',
    image: '/images/studio/press-whitemad-dehesa.webp',
  },
  {
    key: 'labelGuide',
    publication: 'Label Magazine',
    href: 'https://label-magazine.com/sklep/ksiazki/polska-miejski-przewodnik',
    image: '/images/studio/press-label-guide.webp',
  },
  {
    key: 'plndesignOffice',
    publication: 'PLNdesign.pl',
    href: 'https://plndesign.pl/wnetrza/architektki-urzadzily-kancelarie-na-19-m2-we-wroclawiu-zaczely-od-pytania/',
    image: '/images/studio/press-plndesign-kancelaria.webp',
  },
];

const publicationLogos = [
  {
    src: '/images/studio/logo-label.png',
    width: 104,
    height: 54,
    className: 'h-[38px] w-auto md:h-[48px]',
  },
  {
    src: '/images/studio/logo-whitemad.png',
    width: 70,
    height: 66,
    className: 'h-[48px] w-auto md:h-[58px]',
  },
  {
    src: '/images/studio/logo-plndesign.png',
    width: 122,
    height: 14,
    className: 'h-[13px] w-auto md:h-[16px]',
  },
] as const;

export default function StudioPage() {
  const t = useTranslations('studio');

  return (
    <>
      <Navbar />
      <main className="pt-[112px] md:pt-[124px]">
        <section className="px-2 md:px-3">
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src="/images/studio/team.webp"
              alt={t('heroImageAlt')}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        </section>

        <section className="px-5 pt-14 md:px-10 md:pt-20 lg:px-[68px]">
          <div className="mx-auto max-w-content">
            <h1 className="text-[clamp(34px,4.15vw,64px)] font-[400] uppercase leading-[1.08] tracking-[-0.035em] text-coral">
              {t('manifesto')}
            </h1>
          </div>
        </section>

        <section className="px-5 py-20 md:px-10 md:py-28 lg:px-[68px] lg:py-36">
          <div className="mx-auto grid max-w-content gap-14 md:grid-cols-2 md:items-start md:gap-16 lg:gap-24">
            <p className="max-w-[610px] text-[18px] font-[400] leading-[1.35] tracking-[-0.025em] text-dark md:text-[23px] lg:text-[27px]">
              {t('intro')}
            </p>
            <div className="flex md:justify-center">
              <div className="relative aspect-[2/3] w-full max-w-[470px] overflow-hidden">
                <Image
                  src="/images/studio/studio-detail.webp"
                  alt={t('detailImageAlt')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 md:px-10 md:pb-32 lg:px-[68px] lg:pb-44">
          <div className="mx-auto max-w-content">
            <div className="mb-14 flex flex-col gap-10 md:mb-20 md:flex-row md:items-center md:justify-between">
              <h2 className="text-[clamp(42px,5vw,72px)] font-[900] uppercase leading-none tracking-[-0.045em] text-dark">
                {t('pressHeading')}
              </h2>
              <div className="flex flex-wrap items-center gap-8 md:justify-end md:gap-10 lg:gap-12">
                {publicationLogos.map((logo) => (
                  <Image
                    key={logo.src}
                    src={logo.src}
                    alt=""
                    width={logo.width}
                    height={logo.height}
                    className={logo.className}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {pressItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={item.image}
                      alt={t(`press.items.${item.key}.imageAlt`)}
                      fill
                      className="object-cover transition-opacity duration-200 group-hover:opacity-80 group-focus-visible:opacity-80"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <h3 className="mt-4 text-[16px] font-[900] uppercase leading-[1.1] text-dark md:text-[18px]">
                    {item.publication}
                  </h3>
                  <p className="mt-1 max-w-[410px] text-[14px] font-[400] leading-[1.25] text-dark md:text-[16px]">
                    {t(`press.items.${item.key}.title`)}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FooterBanner showMarquee={false} />
    </>
  );
}
```

- [ ] **Step 3: Run source, type, lint, and i18n checks**

Run:

```bash
node -e "const fs=require('fs'); const source=fs.readFileSync('app/[locale]/studio/page.tsx','utf8'); for (const value of ['/images/studio/team.webp','label-magazine.com/wnetrza/artykuly','whitemad.pl/delikatesy-we-wroclawiu-dehesa','plndesign.pl/wnetrza']) { if (!source.includes(value)) throw new Error('missing '+value); }"
pnpm typecheck
pnpm exec eslint 'app/[locale]/studio/page.tsx'
pnpm check:i18n
```

Expected: all commands exit 0 with no TypeScript or ESLint errors and successful locale-key parity.

- [ ] **Step 4: Commit the page implementation**

```bash
git add 'app/[locale]/studio/page.tsx'
git commit -m "Build Studio page from approved layout"
```

Expected: one commit containing only the Studio route replacement.

---

### Task 4: Visual Acceptance and Full Regression Verification

**Files:**
- Create: `.context/verify-site/` screenshots (ignored, verification artifacts only)
- Modify: none unless a failing verification result is approved as a follow-up fix

**Interfaces:**
- Consumes: Completed assets, locale messages, and Studio route from Tasks 1-3.
- Produces: Fresh build, route-status, console, responsive screenshot, and PDF-comparison evidence.

- [ ] **Step 1: Run the full project gate**

Run:

```bash
pnpm check
```

Expected: exit code 0 for typecheck, lint, i18n parity, and production build.

- [ ] **Step 2: Start or reuse the Conductor-isolated dev server**

Run:

```bash
if ! curl -sf -o /dev/null "http://localhost:${CONDUCTOR_PORT:-8080}/pl"; then
  pnpm dev > .context/studio-dev.log 2>&1 &
  echo $! > .context/studio-dev.pid
fi
for attempt in $(seq 1 60); do
  curl -sf -o /dev/null "http://localhost:${CONDUCTOR_PORT:-8080}/pl/studio" && break
  sleep 1
done
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:${CONDUCTOR_PORT:-8080}/pl/studio"
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:${CONDUCTOR_PORT:-8080}/en/studio"
```

Expected: both Studio routes return `200`.

- [ ] **Step 3: Capture Studio comparison screenshots**

Use the in-app browser workflow to capture:

- `/pl/studio` at 1528px viewport width, full page
- `/en/studio` at 1528px viewport width, full page
- `/pl/studio` at 390px viewport width, full page
- `/en/studio` at 390px viewport width, full page

Save them as:

```text
.context/verify-site/pl-studio-desktop.png
.context/verify-site/en-studio-desktop.png
.context/verify-site/pl-studio-mobile.png
.context/verify-site/en-studio-mobile.png
```

Expected: no page-level console errors; no clipped founders, manifesto, titles, logos, or cards; mobile cards are one column; English titles visibly end in `[PL]`.

- [ ] **Step 4: Compare the Polish desktop screenshot with the PDF raster**

Compare `.context/verify-site/pl-studio-desktop.png` side by side with `.context/design/studio/pdf/page-1.png`.

Expected visual landmarks, in order:

1. Wide studio team portrait beneath the fixed navigation
2. Large coral manifesto line
3. Left-column Studio description and right-column portrait
4. Dark press heading and three-logo row
5. Three press cards on the first row and one on the second
6. Beige page ground and restrained coral usage throughout

Record any mismatch in `.context/studio-visual-review.md` with the affected section and screenshot path. Do not silently change production files during the verification gate.

- [ ] **Step 5: Run the complete repository `verify-site` workflow**

Build the route list from current static routes and every slug in `data/projects.ts`, then verify both locales plus development-only design-system routes. For every route, record HTTP status, console errors, warnings, and a full-page screenshot under `.context/verify-site/`.

Expected PASS criteria:

- Every public localized route returns `200`.
- Both development design-system routes return `200`.
- Zero route console errors.
- Zero site-wide resource errors.
- Warnings, if any, are listed separately and do not hide errors.

- [ ] **Step 6: Stop only the dev server started by this task**

Run:

```bash
if test -f .context/studio-dev.pid; then
  kill "$(cat .context/studio-dev.pid)" 2>/dev/null || true
  rm .context/studio-dev.pid
fi
```

Expected: the task-owned server stops; any pre-existing dev server remains running.

- [ ] **Step 7: Review final repository state**

Run:

```bash
git status --short
git log --oneline -4
git diff origin/main...HEAD --stat
```

Expected: only ignored `.context/` verification artifacts and pre-existing unrelated untracked files remain; the latest commits are the design spec, assets, localized content, and Studio implementation.
