# Midcentury Project Route Rename — Design

Date: 2026-07-22

## Goal

Change the public project URL from `mieszkanie-widmo` to `mieszkanie-midcentury` without breaking previously shared or indexed links.

## Canonical project slug

The project catalog slug and its entry in `projectDisplayOrder` become `mieszkanie-midcentury`. Because project links, static parameters, sitemap entries, canonical metadata, JSON-LD, and `llms.txt` all derive from the catalog slug, they automatically publish only the new route for both locales:

- `/pl/projekty/mieszkanie-midcentury`
- `/en/projekty/mieszkanie-midcentury`

Project content, display order, translations, and presentation remain unchanged.

## Permanent legacy redirect

`next.config.mjs` adds one locale-aware redirect:

```js
{
  source: '/:locale(pl|en)/projekty/mieszkanie-widmo',
  destination: '/:locale/projekty/mieszkanie-midcentury',
  permanent: true,
}
```

Next.js evaluates configuration redirects before rendering and emits HTTP 308 for `permanent: true`. The captured locale is reused in the destination, and query parameters remain intact. The old route is not rendered, included in the sitemap, or exposed as a canonical URL.

## Asset boundary

The existing `/images/mieszkanie-widmo/` directory and image references remain unchanged. They are internal static asset paths, not public page routes; renaming them would add a large binary-only diff without changing the visible URL or SEO behavior.

## Testing and verification

- Add a failing source contract for the new canonical slug, the absence of the old slug from active project data/order, and the exact permanent redirect.
- Update the approved project-order expectation to use `mieszkanie-midcentury` in the same position.
- Run the focused tests, then `pnpm check`.
- In a production server, assert both new locale routes return 200, both old locale routes return 308 with matching-locale `Location` headers, and the new route emits its own canonical/JSON-LD URL.
- Verify sitemap and `llms.txt` contain the new slug and omit the old route slug.
