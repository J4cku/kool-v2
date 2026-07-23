import { projects } from '@/data/projects';
import { pressItems } from '@/data/press';
import { BASE_URL, INSTAGRAM_URL } from '@/lib/site';
import plMessages from '@/messages/pl.json';

// llms.txt (llmstxt.org) generated from data/projects.ts at build time so
// project facts can never drift from the site content
export const dynamic = 'force-static';

export function GET() {
  const projectLines = projects.map((project) => {
    const category = project.category === 'mieszkalne' ? 'residential' : 'commercial';
    const status = project.status === 'in_progress' ? ', in progress' : '';
    return `- [${project.title} — ${project.location}](${BASE_URL}/pl/projekty/${project.slug}): ${category}, ${project.area}, ${project.year}${status}. ${project.description}`;
  });

  const pressLines = pressItems.map(
    (item) =>
      `- [${item.publication} — ${plMessages.studio.press.items[item.key].title}](${item.href})`
  );

  const body = `# kool studio — Architektura Wnętrz / Interior Architecture & Design

> kool studio is a Wrocław-based interior architecture practice led by architects Ola Kilińska and Ola Leszczyńska. The studio designs distinctive residential and commercial interiors, working from Wrocław on projects across Poland — including Warsaw, Łódź and Gdańsk. Project descriptions below are in Polish.

## Pages
- [Projekty / Projects](${BASE_URL}/pl/projekty): portfolio of residential and commercial interiors
- [Oferta / Services](${BASE_URL}/pl/oferta): scope of services for commercial and residential projects
- [Studio / About](${BASE_URL}/pl/studio): the studio, its founders and press features
- [Kontakt / Contact](${BASE_URL}/pl/kontakt): contact details

English versions of all pages live under /en/ (e.g. ${BASE_URL}/en/projekty).

## Services
- Interior architecture (concept, construction documentation, author supervision)
- Custom furniture design
- Custom lighting design
- Visual identity and branding for commercial spaces
- Uniform design for hospitality and retail
- Sanitary-approval (Sanepid) support for food-service venues

## Location
- Office: Zaporoska 83/15, 53-415 Wrocław, Poland
- Service area: Wrocław, Warsaw, and all of Poland

## Contact
- Email: hello@koolstudio.pl
- Instagram: ${INSTAGRAM_URL}
- Website: ${BASE_URL}

## Projects
${projectLines.join('\n')}

## Press
${pressLines.join('\n')}

## Keywords
interior design Wrocław, interior architect Poland, commercial interior design, residential interior design, restaurant design, hotel interior design, custom furniture design, architekt wnętrz Wrocław, projektowanie wnętrz, architektura wnętrz Wrocław, projektowanie wnętrz Warszawa
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
