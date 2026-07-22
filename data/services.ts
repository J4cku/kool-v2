// Service landing-page content + types. Same pattern as data/projects.ts:
// Polish is canonical on the top-level fields; the required `en` block
// overrides them, resolved by localizeService() for the en locale.
//
// IRON RULE (SEO playbook): every claim here must trace to copy the site
// already publishes — the service truth in messages/*.json under `oferta.*`
// (line descriptions, scope lists, the 7 process steps) and the project facts
// in data/projects.ts. The reproduced scope list and the 7 process steps are
// NOT duplicated here — pages read them straight from messages so there is a
// single source of truth. This file only carries page-specific framing
// (hero lead, recognition situations, proof angles, FAQs) that recombines
// already-published phrasing. No prices, durations, revision counts, remote
// policy, guarantees or SLAs (docs/playbook/decision-log.md).

// Which published service line each page draws its scope + description from.
export type ServiceLine = 'residential' | 'commercial';

// One FAQ. `link.href` is locale-independent: an on-page anchor ('#zakres')
// or a route ('/kontakt', '/projekty/<slug>'). Each answer ends with this
// link (playbook: FAQ answers point at the relevant section/page).
export type ServiceFaq = {
  q: string;
  a: string;
  link: { label: string; href: string };
};

// English copy for a service. Parallel arrays stay index-aligned with the
// Polish ones (situations ↔ situations, proofAngles ↔ proofSlugs, faqs ↔ faqs).
export type ServiceTranslation = {
  heroName?: string;
  heroLead: string;
  heroImageAlt: string;
  hubTagline?: string;
  situations: string[];
  proofAngles: string[];
  faqs: ServiceFaq[];
};

export type Service = {
  slug: 'projekt-mieszkania' | 'projekt-domu' | 'wnetrza-komercyjne';
  // The published line this page's scope + description come from.
  line: ServiceLine;
  heroName: string;
  heroLead: string;
  heroImage: string;
  heroImageAlt: string;
  // Short descriptive tagline for the hub links block.
  hubTagline: string;
  // 3–5 recognition situations, each grounded in a published scope item.
  situations: string[];
  // Proof projects (slugs into data/projects.ts) + one angle each, in order.
  proofSlugs: string[];
  proofAngles: string[];
  // JSON-LD Service.serviceType — a subset of the org's already-published
  // serviceType list (lib/schema.ts), locale-independent.
  serviceType: string[];
  faqs: ServiceFaq[];
  en: ServiceTranslation;
};

const serviceCatalog: Service[] = [
  {
    slug: 'projekt-mieszkania',
    line: 'residential',
    heroName: 'Projekt mieszkania',
    heroLead:
      'Projektujemy apartamenty o podwyższonym standardzie w dialogu z kontekstem i potrzebami mieszkańców — od układu funkcjonalnego, przez projekt koncepcyjny i dokumentację wykonawczą, po nadzór autorski.',
    heroImage: '/images/mieszkanie-widmo/KOOL_m_00_01.webp',
    heroImageAlt: 'Wnętrze mieszkania zaprojektowane przez Kool Studio',
    hubTagline:
      'Apartamenty o podwyższonym standardzie — od układu funkcjonalnego po nadzór autorski.',
    situations: [
      'Odbierasz mieszkanie od dewelopera i chcesz wprowadzić zmiany lokatorskie, zanim ekipa wejdzie na budowę.',
      'Zastany układ funkcjonalny nie odpowiada codziennym potrzebom mieszkańców i wymaga przeprojektowania.',
      'Potrzebujesz autorskich zabudów i rozwiązań stolarskich dopasowanych do konkretnego wnętrza, a nie gotowych mebli z katalogu.',
      'Chcesz mieć pełną dokumentację wykonawczą i kompleksowe zestawienia materiałów, żeby przejść do realizacji z wycenami od sprawdzonych wykonawców.',
      'Zależy ci na nadzorze autorskim, aby projekt został zrealizowany zgodnie z założeniami.',
    ],
    proofSlugs: [
      'mieszkanie-midcentury',
      'mieszkanie-walecznych',
      'mieszkanie-strachowicka',
      'mieszkanie-gdansk',
    ],
    proofAngles: [
      'Otwarty układ wydobyty z podzielonej przestrzeni; kolorowe lastryko, turkusowe płytki i marmur Bianco Carrara.',
      'Przedwojenna kamienica zinterpretowana na nowo — bordo, błękit i kolekcja vintage właścicieli.',
      'Wnętrze terapeutyczne zaprojektowane z myślą o potrzebach związanych z ADHD.',
      'Ciepły brutalizm w intymnym wydaniu — beton oddychający ciepłem i światłem.',
    ],
    serviceType: ['Interior Architecture', 'Interior Design', 'Custom Furniture Design'],
    faqs: [
      {
        q: 'Czym różni się projekt koncepcyjny od dokumentacji wykonawczej?',
        a: 'Projekt koncepcyjny to etap, na którym powstają układy funkcjonalne i wizualizacje pokazujące charakter wnętrza. Dokumentacja wykonawcza to zestaw rysunków technicznych i zestawień, na podstawie których wykonawcy realizują projekt. W naszym procesie oba etapy następują po sobie — od koncepcji po precyzyjną dokumentację.',
        link: { label: 'Zobacz proces projektowy', href: '#proces' },
      },
      {
        q: 'Kiedy najlepiej zacząć współpracę z projektantem?',
        a: 'Im wcześniej, tym więcej decyzji można rozłożyć w czasie i zaplanować spokojnie. Jeśli kupujesz mieszkanie od dewelopera, warto zacząć jeszcze przed wykończeniem — pozwala to wprowadzić zmiany lokatorskie i dopasować układ funkcjonalny, zanim ekipa wejdzie na budowę.',
        link: { label: 'Zobacz, kiedy warto', href: '#kiedy-warto' },
      },
      {
        q: 'Czy można przenieść kuchnię albo łazienkę?',
        a: 'To zależy od kilku technicznych uwarunkowań — przebiegu istniejących instalacji wodno-kanalizacyjnych i wentylacji, możliwych spadków kanalizacji, lokalizacji pionów oraz ustaleń z deweloperem lub wspólnotą. Te uwarunkowania analizujemy na etapie inwentaryzacji i układów funkcjonalnych, zanim przesądzimy o zmianach.',
        link: { label: 'Zobacz proces projektowy', href: '#proces' },
      },
      {
        q: 'Czy zajmujecie się nadzorem autorskim?',
        a: 'Tak. Nadzór autorski jest częścią naszego zakresu — czuwamy nad tym, aby projekt został zrealizowany zgodnie z założeniami.',
        link: { label: 'Zobacz zakres projektu', href: '#zakres' },
      },
      {
        q: 'Czy pomagacie w doborze wykonawców i przygotowaniu wycen?',
        a: 'Przygotowujemy kompleksowe zestawienia materiałów i wyposażenia oraz udostępniamy kontakty do sprawdzonych wykonawców, na podstawie których powstają wyceny. Mamy doświadczenie zarówno w budownictwie deweloperskim, jak i z rynku wtórnego.',
        link: { label: 'Zobacz zakres projektu', href: '#zakres' },
      },
    ],
    en: {
      heroName: 'Apartment interior design',
      heroLead:
        "We design premium apartments in dialogue with context and residents' needs — from the functional layout, through conceptual design and construction documentation, to author's supervision.",
      heroImageAlt: 'Apartment interior designed by Kool Studio',
      hubTagline:
        "Premium apartments — from the functional layout to author's supervision.",
      situations: [
        'You are collecting an apartment from the developer and want to make tenant modifications before the builders start on site.',
        "The inherited functional layout doesn't match the residents' everyday needs and calls for a redesign.",
        'You need custom cabinetry and joinery solutions tailored to a specific interior, rather than off-the-shelf furniture.',
        'You want complete construction documentation and comprehensive material specifications so you can move into delivery with quotes from verified contractors.',
        "You want author's supervision so the project is realised in line with the design intent.",
      ],
      proofAngles: [
        'An open layout drawn out of a compartmentalised space; colourful terrazzo, turquoise tiles and Bianco Carrara marble.',
        "A pre-war tenement interpreted anew — burgundy, blue and the owners' vintage collection.",
        'A therapeutic interior designed with ADHD-related needs in mind.',
        'Warm brutalism in an intimate register — concrete breathing with warmth and light.',
      ],
      faqs: [
        {
          q: 'What is the difference between conceptual design and construction documentation?',
          a: 'Conceptual design is the stage where functional layouts and visualisations are developed, showing the character of the interior. Construction documentation is the set of technical drawings and specifications on the basis of which contractors carry out the project. In our process the two stages follow one another — from concept to precise documentation.',
          link: { label: 'See the design process', href: '#proces' },
        },
        {
          q: 'When is the best moment to start working with a designer?',
          a: 'The earlier you start, the more decisions can be spread over time and planned calmly. If you are buying an apartment from a developer, it is worth starting before the fit-out — this makes it possible to introduce tenant modifications and adjust the functional layout before the builders start on site.',
          link: { label: 'See when it makes sense', href: '#kiedy-warto' },
        },
        {
          q: 'Can a kitchen or bathroom be relocated?',
          a: 'It depends on several technical factors — the routing of the existing water and drainage services and ventilation, the achievable drainage falls, the position of the risers, and arrangements with the developer or the building community. We analyse these factors during the inventory and functional-layout stages, before deciding on any changes.',
          link: { label: 'See the design process', href: '#proces' },
        },
        {
          q: "Do you also handle author's supervision?",
          a: "Yes. Author's supervision is part of our scope — we oversee the realisation so that the project is delivered in line with the design intent.",
          link: { label: 'See the project scope', href: '#zakres' },
        },
        {
          q: 'Do you help with selecting contractors and preparing quotes?',
          a: 'We prepare comprehensive material and equipment specifications and share contacts with verified contractors, on the basis of which quotes are prepared. We have experience in both developer and secondary-market construction.',
          link: { label: 'See the project scope', href: '#zakres' },
        },
      ],
    },
  },
  {
    slug: 'projekt-domu',
    line: 'residential',
    heroName: 'Projekt domu',
    heroLead:
      'Projektujemy wnętrza domów o podwyższonym standardzie — prowadzimy proces od koncepcji i układu funkcjonalnego po precyzyjną dokumentację wykonawczą i nadzór autorski, także w reorganizacji istniejących wnętrz.',
    heroImage: '/images/dobrzykowice/KOOL_dd_01.webp',
    heroImageAlt:
      'Wnętrze domu jednorodzinnego w Dobrzykowicach zaprojektowane przez Kool Studio',
    hubTagline:
      'Domy o podwyższonym standardzie — od koncepcji po dokumentację wykonawczą.',
    situations: [
      'Masz dom w stanie deweloperskim lub surowym i potrzebujesz układu funkcjonalnego dopasowanego do potrzeb domowników.',
      'Reorganizujesz istniejący dom — pracujesz na zastanym układzie, część rozwiązań zostaje, część wymaga przeprojektowania.',
      'Zależy ci na spójnej narracji materiałowej i kolorystycznej, która połączy wszystkie kondygnacje domu.',
      'Potrzebujesz autorskich zabudów i rozwiązań stolarskich wykonanych na wymiar.',
      'Chcesz prowadzić projekt od koncepcji po dokumentację wykonawczą i nadzór autorski.',
    ],
    proofSlugs: ['dom-dobrzykowice', 'mieszkanie-walecznych', 'mieszkanie-strachowicka'],
    proofAngles: [
      'Reorganizacja dwupoziomowego domu — świadoma praca na zastanym układzie w palecie bordów, granatów i szafetu.',
      'Przedwojenna kamienica zinterpretowana na nowo — bordo, błękit i kolekcja vintage właścicieli.',
      'Wnętrze terapeutyczne zaprojektowane z myślą o potrzebach związanych z ADHD.',
    ],
    serviceType: ['Interior Architecture', 'Interior Design', 'Custom Furniture Design'],
    faqs: [
      {
        q: 'Czym różni się projekt koncepcyjny od dokumentacji wykonawczej?',
        a: 'Projekt koncepcyjny to etap, na którym powstają układy funkcjonalne i wizualizacje pokazujące charakter wnętrza. Dokumentacja wykonawcza to zestaw rysunków technicznych i zestawień, na podstawie których wykonawcy realizują projekt. Prowadzimy oba etapy po kolei — od koncepcji po precyzyjną dokumentację.',
        link: { label: 'Zobacz proces projektowy', href: '#proces' },
      },
      {
        q: 'Pracujecie na istniejącym układzie domu czy tylko przy nowej budowie?',
        a: 'Pracujemy w obu sytuacjach. Mamy doświadczenie zarówno w budownictwie deweloperskim, jak i z rynku wtórnego, a przy istniejących wnętrzach prowadzimy świadomą reorganizację zastanego układu funkcjonalnego.',
        link: { label: 'Zobacz realizację w Dobrzykowicach', href: '/projekty/dom-dobrzykowice' },
      },
      {
        q: 'Czy można przenieść kuchnię albo łazienkę?',
        a: 'To zależy od kilku technicznych uwarunkowań — przebiegu istniejących instalacji wodno-kanalizacyjnych i wentylacji, możliwych spadków kanalizacji oraz układu konstrukcji. Te uwarunkowania analizujemy na etapie inwentaryzacji i układów funkcjonalnych, zanim przesądzimy o zmianach.',
        link: { label: 'Zobacz proces projektowy', href: '#proces' },
      },
      {
        q: 'Czy zajmujecie się nadzorem autorskim?',
        a: 'Tak. Nadzór autorski jest częścią naszego zakresu — czuwamy nad tym, aby projekt został zrealizowany zgodnie z założeniami.',
        link: { label: 'Zobacz zakres projektu', href: '#zakres' },
      },
      {
        q: 'Czy pomagacie w doborze wykonawców i przygotowaniu wycen?',
        a: 'Przygotowujemy kompleksowe zestawienia materiałów i wyposażenia oraz udostępniamy kontakty do sprawdzonych wykonawców, na podstawie których powstają wyceny.',
        link: { label: 'Zobacz zakres projektu', href: '#zakres' },
      },
    ],
    en: {
      heroName: 'House interior design',
      heroLead:
        "We design premium house interiors — guiding the process from concept and functional layout to precise construction documentation and author's supervision, including the reorganisation of existing interiors.",
      heroImageAlt:
        'Single-family house interior in Dobrzykowice designed by Kool Studio',
      hubTagline: 'Premium houses — from concept to construction documentation.',
      situations: [
        "You have a house in developer-finish or shell condition and need a functional layout tailored to the household's needs.",
        'You are reorganising an existing house — working with the inherited layout, keeping some solutions and redesigning others.',
        'You want a coherent material and colour narrative that binds all the storeys of the house together.',
        'You need custom cabinetry and joinery solutions made to measure.',
        "You want to run the project from concept to construction documentation and author's supervision.",
      ],
      proofAngles: [
        'The reorganisation of a two-storey house — deliberate work with the inherited layout in a palette of burgundy, navy and sage.',
        "A pre-war tenement interpreted anew — burgundy, blue and the owners' vintage collection.",
        'A therapeutic interior designed with ADHD-related needs in mind.',
      ],
      faqs: [
        {
          q: 'What is the difference between conceptual design and construction documentation?',
          a: 'Conceptual design is the stage where functional layouts and visualisations are developed, showing the character of the interior. Construction documentation is the set of technical drawings and specifications on the basis of which contractors carry out the project. We run both stages in sequence — from concept to precise documentation.',
          link: { label: 'See the design process', href: '#proces' },
        },
        {
          q: 'Do you work with a house’s existing layout, or only on new builds?',
          a: 'We work in both situations. We have experience in both developer and secondary-market construction, and for existing interiors we carry out a deliberate reorganisation of the inherited functional layout.',
          link: { label: 'See the Dobrzykowice project', href: '/projekty/dom-dobrzykowice' },
        },
        {
          q: 'Can a kitchen or bathroom be relocated?',
          a: 'It depends on several technical factors — the routing of the existing water and drainage services and ventilation, the achievable drainage falls, and the structural layout. We analyse these factors during the inventory and functional-layout stages, before deciding on any changes.',
          link: { label: 'See the design process', href: '#proces' },
        },
        {
          q: "Do you also handle author's supervision?",
          a: "Yes. Author's supervision is part of our scope — we oversee the realisation so that the project is delivered in line with the design intent.",
          link: { label: 'See the project scope', href: '#zakres' },
        },
        {
          q: 'Do you help with selecting contractors and preparing quotes?',
          a: 'We prepare comprehensive material and equipment specifications and share contacts with verified contractors, on the basis of which quotes are prepared.',
          link: { label: 'See the project scope', href: '#zakres' },
        },
      ],
    },
  },
  {
    slug: 'wnetrza-komercyjne',
    line: 'commercial',
    heroName: 'Wnętrza komercyjne',
    heroLead:
      "Projektujemy wnętrza komercyjne — restauracje, concept store'y, butiki, hotele i lokale usługowe — które wspierają biznes i budują wartość marki.",
    heroImage: '/images/dehesa/kool_dehesa_01.webp',
    heroImageAlt: 'Wnętrze delikatesów Dehesa zaprojektowane przez Kool Studio',
    hubTagline: "Restauracje, concept store'y, butiki, hotele i lokale usługowe.",
    situations: [
      "Otwierasz restaurację, concept store, butik lub lokal usługowy i potrzebujesz spójnej koncepcji wnętrza.",
      'Chcesz zdefiniować charakter, atmosferę i zasady funkcjonowania lokalu, zanim ruszysz z realizacją.',
      'Potrzebujesz projektu funkcjonalnego i strefowania przestrzeni, które wesprze codzienne działanie biznesu.',
      'Planujesz lifting istniejącego wnętrza komercyjnego bez radykalnej przebudowy.',
      'Chcesz połączyć projekt wnętrza z brandingiem, żeby przestrzeń budowała rozpoznawalność marki.',
    ],
    proofSlugs: ['delikatesy-dehesa', 'biuro-dobry-material', 'winobar-lodz', 'kancelaria'],
    proofAngles: [
      'Delikatesy iberyjskie — terrazzo, ciemna stolarka i czerwone akcenty oraz autorska identyfikacja wizualna.',
      'Biuro odzwierciedlające dynamiczny charakter marki — kolor, wielkoformatowe grafiki i mobilne parawany.',
      'Winobar w postindustrialnej hali — zachowany ceglany sufit i intensywny oranż baru. Współpraca z blsk.studio.',
      'Kameralna kancelaria, w której projekt stał się procesem porządkowania funkcji i formy.',
    ],
    serviceType: [
      'Interior Architecture',
      'Interior Design',
      'Custom Furniture Design',
      'Lighting Design',
      'Visual Identity Design',
    ],
    faqs: [
      {
        q: 'Czym różni się projekt koncepcyjny od dokumentacji wykonawczej lokalu?',
        a: 'Koncepcja ustala charakter, atmosferę i zasady funkcjonowania lokalu oraz jego koncepcję wizualną. Dokumentacja wykonawcza to szczegółowy zestaw rysunków, na podstawie których lokal jest budowany. Prowadzimy oba etapy oraz koordynację branż i nadzór autorski.',
        link: { label: 'Zobacz zakres projektu', href: '#zakres' },
      },
      {
        q: "Czy projektujecie lokale gastronomiczne, jak restauracje i bary?",
        a: "Tak — projektujemy między innymi restauracje, concept store'y, butiki, hotele i lokale usługowe.",
        link: { label: 'Zobacz wybrane realizacje', href: '#realizacje' },
      },
      {
        q: 'Czy zajmujecie się koordynacją branż i nadzorem autorskim?',
        a: 'Tak. Koordynacja branż i nadzór autorski są częścią naszego zakresu przy projektach komercyjnych.',
        link: { label: 'Zobacz zakres projektu', href: '#zakres' },
      },
      {
        q: 'Czy można odświeżyć istniejący lokal bez pełnej przebudowy?',
        a: 'Realizujemy liftingi istniejących wnętrz komercyjnych. Zakres zależy od stanu zastanej przestrzeni, przebiegu instalacji i tego, które elementy pozostają — dlatego zaczynamy od analizy założeń w kontekście konkretnego wnętrza.',
        link: { label: 'Zobacz wybrane realizacje', href: '#realizacje' },
      },
      {
        q: 'Czy projekt obejmuje branding lokalu?',
        a: 'Może obejmować — branding jest częścią naszego zakresu przy wnętrzach komercyjnych, a spójna identyfikacja pomaga budować rozpoznawalność marki. Dla delikatesów Dehesa zaprojektowaliśmy między innymi identyfikację wizualną i uniformy.',
        link: { label: 'Zobacz projekt Dehesa', href: '/projekty/delikatesy-dehesa' },
      },
    ],
    en: {
      heroName: 'Commercial interiors',
      heroLead:
        'We design commercial interiors — restaurants, concept stores, boutiques, hotels and service venues — that support business and build brand value.',
      heroImageAlt: 'Dehesa delicatessen interior designed by Kool Studio',
      hubTagline: 'Restaurants, concept stores, boutiques, hotels and service venues.',
      situations: [
        'You are opening a restaurant, concept store, boutique or service venue and need a cohesive interior concept.',
        'You want to define the character, atmosphere and operating principles of the venue before you start on delivery.',
        'You need a functional design and space zoning that supports the day-to-day running of the business.',
        'You are planning a refurbishment of an existing commercial interior without a radical rebuild.',
        "You want to combine the interior design with branding, so the space builds the brand's recognition.",
      ],
      proofAngles: [
        'An Iberian delicatessen — terrazzo, dark joinery and red accents with a bespoke visual identity.',
        "An office reflecting the brand's dynamic character — colour, large-format graphics and movable screens.",
        'A wine bar in a post-industrial hall — a preserved brick ceiling and the intense orange of the bar. In collaboration with blsk.studio.',
        'An intimate law office where the design became a process of ordering function and form.',
      ],
      faqs: [
        {
          q: 'What is the difference between conceptual design and construction documentation for a venue?',
          a: "The concept establishes the character, atmosphere and operating principles of the venue, along with its visual concept. Construction documentation is the detailed set of drawings on the basis of which the venue is built. We run both stages, as well as the coordination of trades and author's supervision.",
          link: { label: 'See the project scope', href: '#zakres' },
        },
        {
          q: 'Do you design hospitality venues such as restaurants and bars?',
          a: 'Yes — we design restaurants, concept stores, boutiques, hotels and service venues, among others.',
          link: { label: 'See selected projects', href: '#realizacje' },
        },
        {
          q: "Do you handle the coordination of trades and author's supervision?",
          a: "Yes. The coordination of trades and author's supervision are part of our scope on commercial projects.",
          link: { label: 'See the project scope', href: '#zakres' },
        },
        {
          q: 'Can an existing venue be refreshed without a full rebuild?',
          a: 'We carry out refurbishments of existing commercial interiors. The scope depends on the condition of the space as found, the routing of the services and which elements remain — which is why we begin by analysing the assumptions in the context of the specific interior.',
          link: { label: 'See selected projects', href: '#realizacje' },
        },
        {
          q: 'Does the design include branding for the venue?',
          a: "It can — branding is part of our scope on commercial interiors, and a cohesive identity helps build the brand's recognition. For the Dehesa delicatessen we designed the visual identity and the uniforms, among other things.",
          link: { label: 'See the Dehesa project', href: '/projekty/delikatesy-dehesa' },
        },
      ],
    },
  },
];

const servicesBySlug = new Map<string, Service>(
  serviceCatalog.map((service) => [service.slug, service]),
);

export const services: Service[] = serviceCatalog;

export function getService(slug: string): Service | undefined {
  return servicesBySlug.get(slug);
}

// Returns the service with its text fields resolved for the given locale.
// Polish is canonical; the en block overrides the localizable fields.
export function localizeService(service: Service, locale: string): Service {
  if (locale !== 'en') return service;
  const { en } = service;
  return {
    ...service,
    heroName: en.heroName ?? service.heroName,
    heroLead: en.heroLead,
    heroImageAlt: en.heroImageAlt,
    hubTagline: en.hubTagline ?? service.hubTagline,
    situations: en.situations,
    proofAngles: en.proofAngles,
    faqs: en.faqs,
  };
}
