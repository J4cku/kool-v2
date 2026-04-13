# Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localhost-development-only design system for Kool Studio that codifies the current site as-is and gives developers and the client a private styleguide surface.

**Architecture:** Keep Tailwind v4 tokens in `app/globals.css` as the source of truth. Add a small flat `components/DesignSystem.tsx` primitive layer for repeated page, section, typography, link, media, and token-display patterns, then use those primitives in `app/[locale]/design-system/page.tsx`. Guard the route with `notFound()` outside `NODE_ENV === 'development'`, and keep it out of navigation and sitemap by not touching those public surfaces.

**Tech Stack:** Next.js 16 App Router, TypeScript, React 19, next-intl, Tailwind CSS v4, existing project data/assets/components.

---

## File Structure

- Create: `components/DesignSystem.tsx`
  - Flat component file matching the repo convention.
  - Owns small reusable primitives used by the private styleguide and available for later site maintenance.
  - Does not import project data or translations.
- Create: `app/[locale]/design-system/page.tsx`
  - Localized dev-only route.
  - Calls `notFound()` when `process.env.NODE_ENV !== 'development'`.
  - Renders a private styleguide using existing tokens, real project data, and existing components where practical.
- Modify: `CLAUDE.md`
  - Add a short note documenting the dev-only design system route for future maintainers.
- Do not modify: `components/Navbar.tsx`
  - The route must stay hidden from site navigation.
- Do not modify: `app/sitemap.ts`
  - The route must stay out of the public sitemap.
- Do not modify: public-facing page files unless implementation reveals a direct compile issue.

## Task 1: Add Design-System Primitives

**Files:**
- Create: `components/DesignSystem.tsx`

- [ ] **Step 1: Check for conflicting component names**

Run:

```bash
rg "DesignSystem|SiteContainer|DsSection|TokenSwatch|TypeSample" components app
```

Expected: no relevant existing definitions. If there are matches, inspect them and avoid duplicate names.

- [ ] **Step 2: Create the primitive component file**

Create `components/DesignSystem.tsx` with primitives like this:

```tsx
import type { ReactNode } from 'react';

type WithChildren = {
  children: ReactNode;
  className?: string;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export function DsPage({ children, className }: WithChildren) {
  return (
    <main className={cx('min-h-screen pt-[120px] md:pt-[160px] pb-24', className)}>
      {children}
    </main>
  );
}

export function DsContainer({ children, className }: WithChildren) {
  return (
    <div className={cx('max-w-content mx-auto px-5 md:px-10 lg:px-12', className)}>
      {children}
    </div>
  );
}

export function DsSection({
  eyebrow,
  title,
  children,
  className,
}: WithChildren & {
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className={cx('py-12 md:py-16 border-t border-coral/40', className)}>
      <div className="grid gap-8 md:grid-cols-[minmax(180px,0.28fr)_1fr]">
        <div>
          {eyebrow && (
            <p className="text-[12px] font-[700] uppercase tracking-[0.14em] text-coral/70">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-2 text-[28px] md:text-[40px] font-[800] leading-[1.05] uppercase text-coral">
            {title}
          </h2>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

export function DsDisplayText({ children, className }: WithChildren) {
  return (
    <p className={cx('uppercase text-coral font-[700] leading-[1.1] text-[32px] md:text-[54px]', className)}>
      {children}
    </p>
  );
}

export function DsBodyText({ children, className }: WithChildren) {
  return (
    <p className={cx('text-[15px] md:text-[18px] leading-[1.7] font-[300] text-dark', className)}>
      {children}
    </p>
  );
}

export function DsTextLink({
  children,
  href,
  className,
}: WithChildren & {
  href: string;
}) {
  return (
    <a
      href={href}
      className={cx('inline-flex text-[15px] font-[600] uppercase text-coral transition-opacity hover:opacity-60', className)}
    >
      {children}
    </a>
  );
}

export function TokenSwatch({
  name,
  value,
  className,
}: {
  name: string;
  value: string;
  className: string;
}) {
  return (
    <div className="grid gap-3">
      <div className={cx('aspect-[4/3] border border-dark/15', className)} />
      <div>
        <p className="text-[13px] font-[700] uppercase text-dark">{name}</p>
        <p className="text-[13px] font-[400] text-dark/60">{value}</p>
      </div>
    </div>
  );
}

export function TypeSample({
  label,
  children,
  className,
}: WithChildren & {
  label: string;
}) {
  return (
    <div className="border-t border-dark/20 py-5">
      <p className="mb-3 text-[12px] font-[600] uppercase tracking-[0.12em] text-dark/60">
        {label}
      </p>
      <div className={className}>{children}</div>
    </div>
  );
}

export function MediaFrame({ children, className }: WithChildren) {
  return (
    <div className={cx('relative overflow-hidden bg-dark/5', className)}>
      {children}
    </div>
  );
}
```

Keep these primitives intentionally small. Do not add a general-purpose component library or new styling tokens in this task.

- [ ] **Step 3: Run TypeScript/build verification**

Run:

```bash
pnpm build
```

Expected: build reaches the same baseline as before this task, or fails only for a known pre-existing issue. If it fails due to `components/DesignSystem.tsx`, fix that before continuing.

- [ ] **Step 4: Commit**

```bash
git add components/DesignSystem.tsx
git commit -m "Add design system primitives"
```

## Task 2: Add The Dev-Only Styleguide Route

**Files:**
- Create: `app/[locale]/design-system/page.tsx`
- Read: `data/projects.ts`
- Read: `components/ProjectCard.tsx`

- [ ] **Step 1: Create the localized route directory**

Run:

```bash
mkdir -p 'app/[locale]/design-system'
```

- [ ] **Step 2: Add the route page**

Create `app/[locale]/design-system/page.tsx`. Use this structure and adapt only for compile correctness:

```tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  DsBodyText,
  DsContainer,
  DsDisplayText,
  DsPage,
  DsSection,
  DsTextLink,
  MediaFrame,
  TokenSwatch,
  TypeSample,
} from '@/components/DesignSystem';
import ProjectCard from '@/components/ProjectCard';
import { projects } from '@/data/projects';

const completedProject = projects.find((project) => project.status === 'completed') ?? projects[0];
const inProgressProject = projects.find((project) => project.status === 'in_progress') ?? projects[0];

export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const { locale } = await params;
  const projectIndexHref = `/${locale}/projekty`;

  return (
    <DsPage>
      <DsContainer>
        <header className="pb-16 md:pb-24">
          <p className="text-[13px] font-[700] uppercase tracking-[0.16em] text-coral/70">
            Local design system
          </p>
          <h1 className="mt-4 uppercase text-coral font-[900] leading-[0.95] text-[42px] md:text-[82px]">
            Kool Studio visual language
          </h1>
          <p className="mt-6 max-w-[760px] text-[16px] md:text-[20px] leading-[1.6] font-[300] text-dark">
            Development-only reference for current tokens, type, layout, imagery, motion patterns, and project components.
          </p>
        </header>

        <DsSection eyebrow="01" title="Tokens">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            <TokenSwatch name="beige" value="#E5DDD0" className="bg-beige" />
            <TokenSwatch name="coral" value="#FC3117" className="bg-coral" />
            <TokenSwatch name="dark" value="#1A1A1A" className="bg-dark" />
            <TokenSwatch name="muted" value="#888888" className="bg-muted" />
            <TokenSwatch name="white" value="#FFFFFF" className="bg-white" />
          </div>
        </DsSection>

        <DsSection eyebrow="02" title="Typography">
          <TypeSample label="Display heading" className="uppercase text-coral font-[900] leading-[0.95] text-[42px] md:text-[82px]">
            AUTORSKIE WNĘTRZA
          </TypeSample>
          <TypeSample label="Section display" className="uppercase text-coral font-[700] leading-[1.15] text-[32px] md:text-[54px]">
            WNĘTRZA, KTÓRE ZOSTAJĄ NA DŁUŻEJ.
          </TypeSample>
          <TypeSample label="Body copy" className="max-w-[760px] text-[15px] md:text-[18px] leading-[1.7] font-[300] text-dark">
            Projektujemy autorskie wnętrza mieszkalne i komercyjne z dbałością o detal, kontekst i charakter miejsca.
          </TypeSample>
        </DsSection>

        <DsSection eyebrow="03" title="Layout">
          <div className="grid gap-6">
            <DsDisplayText>Max-width content, generous page rhythm, image-led sections.</DsDisplayText>
            <DsBodyText>
              Content uses a 1400px max-width with responsive horizontal padding. Public pages lean on large top offsets, full-width image bands, square project imagery, and 50/50 editorial rows.
            </DsBodyText>
          </div>
        </DsSection>

        <DsSection eyebrow="04" title="Interaction">
          <div className="grid gap-5">
            <DsTextLink href={projectIndexHref}>Project index link</DsTextLink>
            <div className="overflow-hidden whitespace-nowrap border-y border-coral/40 py-4">
              <div className="animate-marquee inline-block">
                {Array.from({ length: 4 }).map((_, index) => (
                  <span key={index} className="font-[400] uppercase text-coral leading-tight mx-8 text-[28px] md:text-[54px]">
                    WE ARE KOOL AND WE DESIGN KOOL THINGS!
                  </span>
                ))}
              </div>
            </div>
          </div>
        </DsSection>

        <DsSection eyebrow="05" title="Imagery">
          <div className="grid gap-[3px] md:grid-cols-3">
            {[
              '/images/dobrzykowice.jpg',
              '/images/dehesa.jpg',
              '/images/kancelaria.jpg',
            ].map((src) => (
              <MediaFrame key={src} className="aspect-square">
                <Image src={src} alt="" fill className="object-cover transition-transform duration-[600ms] hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 33vw" />
              </MediaFrame>
            ))}
          </div>
        </DsSection>

        <DsSection eyebrow="06" title="Project cards">
          <div className="grid gap-5 md:grid-cols-2">
            <ProjectCard project={completedProject} />
            <ProjectCard project={inProgressProject} />
          </div>
        </DsSection>

        <DsSection eyebrow="07" title="Localization">
          <DsBodyText>
            Public content is localized under /pl and /en with next-intl. The styleguide route is localized too, but it stays hidden from navigation and sitemap output.
          </DsBodyText>
        </DsSection>
      </DsContainer>
    </DsPage>
  );
}
```

Keep the content factual and practical. Avoid marketing copy. If TypeScript reports an import or component issue, fix the smallest relevant part.

- [ ] **Step 3: Confirm route is not added to public surfaces**

Run:

```bash
rg "design-system" components/Navbar.tsx app/sitemap.ts
```

Expected: no matches. If there are matches, remove them unless they are comments in this plan.

- [ ] **Step 4: Run build verification**

Run:

```bash
pnpm build
```

Expected: build succeeds, or any failure is unrelated and documented. A failure from `app/[locale]/design-system/page.tsx` must be fixed before continuing.

- [ ] **Step 5: Commit**

```bash
git add 'app/[locale]/design-system/page.tsx'
git commit -m "Add dev-only design system route"
```

## Task 3: Document The Local Route

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add a short maintenance note**

In `CLAUDE.md`, add a small section near the existing project structure or conventions:

```markdown
## Design System

- Local development only: `/pl/design-system` and `/en/design-system`
- Route file: `app/[locale]/design-system/page.tsx`
- Purpose: private reference for current tokens, type, layout, image treatment, interaction patterns, and project cards
- Do not add this route to public navigation or sitemap unless the access model changes
```

- [ ] **Step 2: Check the diff**

Run:

```bash
git diff -- CLAUDE.md
```

Expected: only the design-system maintenance note changed.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "Document design system route"
```

## Task 4: Local And Production Access Verification

**Files:**
- Verify: `app/[locale]/design-system/page.tsx`
- Verify: `components/DesignSystem.tsx`
- Verify: `app/sitemap.ts`
- Verify: `components/Navbar.tsx`

- [ ] **Step 1: Run production build**

Run:

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 2: Start the dev server**

Run:

```bash
pnpm dev
```

Expected: Next dev server starts. Use the printed localhost URL.

- [ ] **Step 3: Verify dev route renders**

Open:

```text
http://localhost:3000/pl/design-system
```

Expected: the styleguide renders with token swatches, typography, layout notes, interaction/marquee example, image examples, and project cards.

Also check:

```text
http://localhost:3000/en/design-system
```

Expected: route renders in the English locale segment. Styleguide copy may remain English in both locales for this first pass because it is a private developer/client reference, not public content.

- [ ] **Step 4: Verify responsive sanity**

Use browser devtools or Playwright to check at:

```text
390x844
1440x1000
```

Expected: text does not overflow horizontally, project cards remain stable, images render, and the marquee does not obscure following content.

- [ ] **Step 5: Verify route is not in sitemap or nav**

Run:

```bash
rg "design-system" app/sitemap.ts components/Navbar.tsx
```

Expected: no matches.

- [ ] **Step 6: Verify production runtime blocks the route**

Stop the dev server from Step 2, then run:

```bash
pnpm build
pnpm start
```

Open:

```text
http://localhost:3000/pl/design-system
```

Expected: 404/not found because `process.env.NODE_ENV !== 'development'`.

- [ ] **Step 7: Commit any verification fixes**

If verification required fixes, commit them:

```bash
git add components/DesignSystem.tsx 'app/[locale]/design-system/page.tsx' CLAUDE.md
git commit -m "Fix design system verification issues"
```

If there were no fixes, do not create an empty commit.

## Task 5: Final Review

**Files:**
- Review all changed files.

- [ ] **Step 1: Inspect status**

Run:

```bash
git status --short
```

Expected: no unintended tracked changes. Unrelated untracked local directories, such as `.omc/`, should remain untouched unless the user explicitly asks otherwise.

- [ ] **Step 2: Inspect final commits**

Run:

```bash
git log --oneline --decorate -6
```

Expected: commits for primitives, route, docs, and any verification fixes appear above the spec commit.

- [ ] **Step 3: Summarize verification**

Record the final verification commands and results in the handoff:

```text
pnpm build
Dev route: /pl/design-system and /en/design-system
Production route: /pl/design-system returns not found
Responsive checks: 390x844 and 1440x1000
```

Do not claim a command passed unless it was actually run and the output confirmed it.
