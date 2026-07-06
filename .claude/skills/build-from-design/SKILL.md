---
name: build-from-design
description: Use when implementing a page or view from a designer-delivered PDF or Adobe Illustrator (.ai) mockup, or when extracting copy, photos, colors, or typefaces from a design file.
---

# Build From Design

Design files are full page mockups to implement **faithfully** — layout, spacing, and type as designed, not inspiration. Incoming files go in `design/` (gitignored inbox); extractions go in `.context/design/<name>/`.

## Pipeline

0. **Create the work dir first** — poppler tools do not create output directories:
   `mkdir -p .context/design/<name>`
1. **Rasterize** one PNG per page/artboard and read them:
   `pdftoppm -r 200 -png design/<file> .context/design/<name>/page`
   For fine detail on one page: `pdftoppm -r 300 -f 2 -l 2 -png design/<file> .context/design/<name>/detail`
2. **Extract copy exactly:**
   `pdftotext -layout design/<file> .context/design/<name>/copy.txt`
   Use this text verbatim for all Polish copy — never retype diacritics from a screenshot. Empty output means the text was outlined; flag that and transcribe from the raster with extra care.
3. **Extract photos:**
   `pdfimages -all design/<file> .context/design/<name>/img`
   Move keepers to `public/images/<slug>/`, converting/resizing per the add-project skill's image rules.
4. **Map every color and typeface to tokens.** Fonts: `pdffonts design/<file>`. Colors: sample from the raster. Targets are the `@theme` tokens in `app/globals.css` — beige `#E5DDD0`, coral `#FC3117`, dark `#1A1A1A`, muted `#888888`, white `#FFFFFF`, Poppins.
   **If the design uses a value outside the token set: STOP and ask** whether it's a new token or an export artifact.
   - "It's close enough to coral" → it IS coral: use the token.
   - "It's clearly intentional, I'll just hardcode it" → still stop and ask.
   - Never hardcode a one-off hex or font.
5. **Reuse before building.** Read the Design Language section of CLAUDE.md, then check `components/` (Navbar, FooterBanner, ImageStrip, ProjectCard, ProjectGrid, `components/oferta/` section patterns) before writing new components.
6. **Verify faithfully.** Run the verify-site skill, then compare your page's screenshot side-by-side with the rasterized mockup at the same viewport width. Iterate until layout, spacing, and type match the mockup.

## .ai files

Most .ai files embed a PDF stream, so the pipeline works unchanged. If poppler rejects the file:
`brew install ghostscript`
`gs -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -o .context/design/<name>/converted.pdf design/<file>.ai`
then run the pipeline on the converted PDF. If ghostscript also fails, ask for an export with "Create PDF Compatible File" enabled.
