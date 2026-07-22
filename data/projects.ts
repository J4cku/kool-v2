export type ProjectFilter = 'wszystkie' | 'mieszkalne' | 'komercyjne';
export const projectFilters: ProjectFilter[] = ['wszystkie', 'mieszkalne', 'komercyjne'];

export type ProjectSlider = {
  beforeSrc: string;
  afterSrc: string;
  labels?: [string, string];
  index: number;
  aspect?: string;
};

// Structured case study: a real problem → design decision → result arc,
// restated from a project's already-published description (SEO playbook iron
// rule — never invent problems, decisions, outcomes, metrics or quotes). Only
// projects whose published copy genuinely supports the arc carry one.
export type CaseStudy = {
  problem: string; // the real starting conflict/constraint, from published copy
  decisions: string[]; // 2–5 key design decisions, each traceable to published copy
  result: string; // the outcome as published (qualitative is fine; no invented numbers)
};

// Which service landing page a project's case block cross-links to. Derived
// from the category heuristic in relatedServiceSlug(); set explicitly on a
// Project only where the heuristic is wrong (a house, or a public-competition
// project with no matching commercial service line → the /oferta hub).
export type RelatedService =
  | 'projekt-mieszkania'
  | 'projekt-domu'
  | 'wnetrza-komercyjne'
  | 'oferta';

// English copy for a project. Polish stays canonical on the main fields;
// omitted optional fields fall back to the Polish value (proper nouns).
export type ProjectTranslation = {
  title?: string;
  location?: string;
  scope: string[];
  description: string;
  descriptionBlocks?: string[];
  meta?: { title?: string; location?: string };
  // Faithful English translation of the Polish caseStudy (same shape).
  caseStudy?: CaseStudy;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  location: string;
  category: 'mieszkalne' | 'komercyjne';
  status: 'completed' | 'in_progress';
  year: number;
  area: string;
  scope: string[];
  thumbnail: string;
  featured: boolean;
  images: string[];
  description: string;
  photoCredit?: string;
  descriptionBlocks?: string[];
  fullWidthIndices?: number[];
  containedPairs?: { indices: [number, number]; labels?: [string, string]; scale?: number; aspect?: string }[];
  reverseLastRow?: boolean;
  // Detail-page meta table overrides (card keeps the short title/location)
  meta?: { title?: string; location?: string; collaboration?: string; visualizations?: string };
  // Self-hosted reel video (public/videos/) in the gallery flow; index
  // shares the fullWidthIndices space (position in images[], counting the
  // hero, with the reel occupying its own slot). aspect overrides the
  // default 9:16 frame (e.g. 'aspect-[2/3]')
  reel?: { src: string; index: number; aspect?: string };
  // Half-width before/after slider(s), each occupying one gallery slot; index
  // shares the same display-slot space as reel/fullWidthIndices. aspect
  // overrides the default 2:3 frame (e.g. 'aspect-square')
  slider?: ProjectSlider | ProjectSlider[];
  // Explicit text-block placement (50/50 row index + which side the text
  // sits on); when omitted the default every-3rd-row rhythm applies.
  // align overrides the default end/start/end vertical cycling
  textRows?: { row: number; side: 'left' | 'right'; align?: 'start' | 'end' }[];
  // Flush image sits right on even rows instead of left (mirrors the
  // default alternation)
  flipRowParity?: boolean;
  // Items rendered 2:3 instead of square when in a flush slot; shares the
  // fullWidthIndices index space
  portraitIndices?: number[];
  // Padded images rendered noticeably smaller (technical drawings); shares
  // the fullWidthIndices index space
  smallIndices?: number[];
  // Optional problem → decisions → result block, restated from this project's
  // own published description (Polish canonical; en block mirrors it).
  caseStudy?: CaseStudy;
  // Optional override for the cross-linked service page (see relatedServiceSlug).
  relatedService?: RelatedService;
  // English copy — resolved by localizeProject() for the en locale
  en: ProjectTranslation;
};

// The service landing page a project's case block cross-links to. An explicit
// `relatedService` wins; otherwise the published category maps to a service
// line — commercial → commercial interiors, residential → apartment design.
// Houses and public-competition projects carry an explicit override.
export function relatedServiceSlug(project: Project): RelatedService {
  if (project.relatedService) return project.relatedService;
  return project.category === 'komercyjne' ? 'wnetrza-komercyjne' : 'projekt-mieszkania';
}

// Slider/pair labels are a small closed vocabulary, translated here rather
// than per project
const LABELS_EN: Record<string, string> = {
  przed: 'before',
  po: 'after',
  noc: 'night',
  dzień: 'day',
  'aranżacja 1': 'layout 1',
  'aranżacja 2': 'layout 2',
};

function localizeLabels(labels?: [string, string]): [string, string] | undefined {
  if (!labels) return undefined;
  return [LABELS_EN[labels[0]] ?? labels[0], LABELS_EN[labels[1]] ?? labels[1]];
}

function localizeSlider(slider: ProjectSlider): ProjectSlider {
  return { ...slider, labels: localizeLabels(slider.labels) };
}

// Returns the project with its text fields resolved for the given locale.
// Polish is canonical; en fields left undefined fall back to the Polish value.
export function localizeProject(project: Project, locale: string): Project {
  if (locale !== 'en') return project;
  const { en } = project;
  return {
    ...project,
    title: en.title ?? project.title,
    location: en.location ?? project.location,
    scope: en.scope,
    description: en.description,
    descriptionBlocks: en.descriptionBlocks ?? project.descriptionBlocks,
    caseStudy: en.caseStudy ?? project.caseStudy,
    meta: project.meta
      ? {
          ...project.meta,
          title: en.meta?.title ?? project.meta.title,
          location: en.meta?.location ?? project.meta.location,
        }
      : undefined,
    containedPairs: project.containedPairs?.map((pair) => ({
      ...pair,
      labels: localizeLabels(pair.labels),
    })),
    slider: project.slider
      ? Array.isArray(project.slider)
        ? project.slider.map(localizeSlider)
        : localizeSlider(project.slider)
      : undefined,
  };
}

const projectCatalog: Project[] = [
  {
    id: '1',
    slug: 'dom-dobrzykowice',
    title: 'dom',
    location: 'Dobrzykowice',
    category: 'mieszkalne',
    status: 'completed',
    year: 2024,
    area: '180 m²',
    scope: ['projekt koncepcyjny', 'dokumentacja wykonawcza', 'nadzór autorski'],
    thumbnail: '/images/dobrzykowice/KOOL_dd_MAIN.webp',
    featured: false,
    images: [
      '/images/dobrzykowice/KOOL_dd_01.webp',
      '/images/dobrzykowice/KOOL_dd_02.webp',
      '/images/dobrzykowice/KOOL_dd_03.webp',
      '/images/dobrzykowice/KOOL_dd_04.webp',
      '/images/dobrzykowice/KOOL_dd_05.webp',
      '/images/dobrzykowice/KOOL_dd_06.webp',
      '/images/dobrzykowice/KOOL_dd_07.webp',
      '/images/dobrzykowice/KOOL_dd_14.webp',
      '/images/dobrzykowice/KOOL_dd_08.webp',
      '/images/dobrzykowice/KOOL_dd_09.webp',
      '/images/dobrzykowice/KOOL_dd_10.webp',
      '/images/dobrzykowice/KOOL_dd_11.webp',
      '/images/dobrzykowice/KOOL_dd_12.webp',
      '/images/dobrzykowice/KOOL_dd_13.webp',
    ],
    fullWidthIndices: [2, 8],
    descriptionBlocks: [
      'Projekt w Dobrzykowicach, w dwupoziomowym domu jednorodzinnym, nie zaczął się od pustej kartki. To reorganizacja istniejącego wnętrza — świadoma praca na zastanym układzie funkcjonalnym i szacunek do tego, co już było. Architektura domu pozostała niezmieniona, podobnie jak część rozwiązań konstrukcyjnych i wybranych elementów wyposażenia. Zamiast radykalnej przebudowy pojawia się precyzyjna ingerencja: zachowane struktury zostały uzupełnione o nowe zabudowy, materiały i kolorystyczną narrację, która nadała całości świeżą tożsamość. To projekt o transformacji poprzez warstwy — kolor, fakturę, światło i detal. O umiejętności wydobycia potencjału z istniejącej przestrzeni i nadania jej wyrazistego, ale spójnego charakteru, który stał się tu narzędziem. Nie jest krzykliwy ani dosłowny. Prowadzi subtelnie i spaja wszystkie kondygnacje w jedną, konsekwentną historię. Wysoki cokół w odcieniu burgundu to wyrazisty i nieoczywisty element dekoracyjny, który buduje rytm i porządkuje przestrzeń. Wędruje przez wiatrołap, salon, kółko, schodząc do prywatnej strefy piętra. Paleta domu opiera się na pięciu tonach: bordowym, beżowym, błękitnym, granatowym i szafkowym. Każdy z nich ma swoje miejsce i funkcję. Tu kolory się uzupełniają, a nie konkurują. Przestrzeń wiatrołapu została potraktowana jako coś więcej niż przejście. Ławeczka szafa w błękitnym laminacie, zintegrowane siedzisko i wielkoformatowe lustro wprowadzają komfort i funkcjonalność od wejścia. Między wiatrołapem a salonem pojawiają się przesuwne drzwi ze szkła ornamentowego. To rozwiązanie nie tylko oszczędza miejsca, lecz także filtruje światło, nadając mu miękkości i prywatności.',
      'W kuchni kolor burgundowy przechodzi płynnie z korytarza w wysoką zabudowę, tworząc mocny element wnętrza. Koresponduje on z szafkową zabudową podręcznej spiżarki, która została ukryta za zabudową istniejącego kominka. To przykład tego, jak kolor może stulic funkcji: każda strefa ma swoją paletę, co intuicyjnie organizuje przestrzeń. Dolne szafki wykończono laminatem drewnopodobnym, z czarnymi i bordowymi detalami. Blat z beżowego konglomeratu z subtelnym wzorem wprowadza fakturę i nawiązuje do wzoru lastryko z wielkoformatowych płytek na posadzce. Na zakończeniu ciągu kuchennego powstał niewielki stolik barowy — miejsce na szybkie śniadania i rozmowy przy gotowaniu. W salonie kominek został wyeksponowany i ubrany w połyskujące, ryfowane płytki ceramiczne w kolorze szafetu. Ich połyskowa struktura pięknie pracuje ze światłem — szczególnie tym bocznym, emitowanym, które w całym domu buduje nastrojowość. Nowa zabudowa telewizyjna w granacie stanowi tło dla burgundowej, modularnej sofy w tkaninie bouclé — miękkiej i przytulnej. Na ścianie obok zawieszono retro witrynę na szklaną zastawę, a pod nią znajduje miejsce komódka na gramofon — ukłon w stronę analogowych rytuałów. Całość dopełnia beżowy dywan o mocnej teksturze. W drugiej części salonu zaprojektowano szafkową zabudowę na książki i dekoracje, przy której ustawiono strefę jadalną z okrągłym stołem. Zasłony z ciemnobezowego sztucznego jedwabiu miękko opadają przy oknach, tłumiąc światło i wspierając akustykę. Łazienka na parterze to odważne zestawienie. W strefie prysznica pojawia się motyw głębokiej mozaiki o wyraźnej fakturze. Sufit pomalowano na bordowo, a ściany wykończono lamperią z płytek w tym samym odcieniu, z jasną fugą podkreślającą rytm. Czarna szafka pod zieloną umywalką i okrągłe lustro dopełniają kompozycji.',
      'Na piętrze korytarz zyskuje lamperię z paneli o wzorze „eklerków" w kolorze bordowym, powyżej której pojawia się jasna tapeta z abstrakcyjnym motywem fal. To subtelne przejście między intensywnością a lekkością. Główna sypialnia zachowuje spójność w kolorystycznym układzie, lecz zyskuje nową tożsamość. Tapeta z motywem pływaczek — inspiracja inwestorki — nadaje jej osobisty charakter. Płytki w wydłużonym formacie z ryfowaniem nawiązującym do paneli z korytarza występują w odcieniach burgundu i granatu. Ich podłużny geometryczny wzór lekko wprowadza rytm i dynamikę. Duże lustro i osobne kinkiety rozświetlają przestrzeń. Sypialnia została zaprojektowana jako kobieca oaza. Delikatna tapeta we wzór kwiatowy, zasłony z satynowego sztrusku, granatowa tapicerka zagłówka i duże owalne lustro w ciemnej ramie — wszystko to tworzy atmosferę intymności i komfortu. Siedzisko przed łóżkiem pełni podwójną funkcję: to zarówno wygodne miejsce do siedzenia, jak i pojemnik na przechowywanie.',
    ],
    description: 'Projekt domu jednorodzinnego w podwrocławskich Dobrzykowicach. Reorganizacja istniejącego wnętrza — świadoma praca na zastanym układzie funkcjonalnym z paletą bordów, granatów i szafetu.',
    relatedService: 'projekt-domu',
    caseStudy: {
      problem: 'Projekt nie zaczął się od pustej kartki — to reorganizacja istniejącego wnętrza, świadoma praca na zastanym układzie funkcjonalnym. Architektura domu, część rozwiązań konstrukcyjnych i wybrane elementy wyposażenia miały pozostać niezmienione.',
      decisions: [
        'Zamiast radykalnej przebudowy — precyzyjna ingerencja: zachowane struktury uzupełniono o nowe zabudowy, materiały i kolorystyczną narrację.',
        'Wysoki cokół w odcieniu burgundu prowadzi przez wiatrołap, salon i schody aż do prywatnej strefy piętra, spajając wszystkie kondygnacje.',
        'Paleta pięciu tonów — bordowego, beżowego, błękitnego, granatowego i szafetu — porządkuje przestrzeń, przypisując każdej strefie własny kolor.',
        'Przesuwne drzwi ze szkła ornamentowego między wiatrołapem a salonem oszczędzają miejsce i filtrują światło.',
      ],
      result: 'Transformacja poprzez warstwy — kolor, fakturę, światło i detal — nadała wnętrzu wyrazisty, lecz spójny charakter i połączyła wszystkie kondygnacje w jedną, konsekwentną historię.',
    },
    en: {
      title: 'house',
      scope: ['conceptual design', 'construction documentation', 'author\'s supervision'],
      description: 'A project for a single-family house in Dobrzykowice, just outside Wrocław. A reorganisation of the existing interior — deliberate work with the inherited functional layout in a palette of burgundy, navy and sage.',
      caseStudy: {
        problem: 'The project did not begin with a blank page — it is a reorganisation of an existing interior, deliberate work with the inherited functional layout. The architecture of the house, some structural solutions and selected pieces of the original fit-out were to remain unchanged.',
        decisions: [
          'Instead of a radical rebuild, a precise intervention: the retained structures were complemented with new built-in joinery, materials and a colour narrative.',
          'A tall burgundy plinth travels through the vestibule, living room and staircase to the private zone upstairs, binding all the storeys together.',
          'A palette of five tones — burgundy, beige, pale blue, navy and sage — orders the space, giving each zone its own colour.',
          'Sliding doors of patterned glass between the vestibule and living room save space and filter the light.',
        ],
        result: 'Transformation through layers — colour, texture, light and detail — gave the interior a distinctive yet coherent character and bound all the storeys into a single, consistent story.',
      },
      descriptionBlocks: [
        'The project in Dobrzykowice, set in a two-storey single-family house, did not begin with a blank page. It is a reorganisation of an existing interior — deliberate work with the inherited functional layout and respect for what was already there. The architecture of the house remained unchanged, as did some of the structural solutions and selected pieces of the original fit-out. Instead of a radical rebuild there is precise intervention: the retained structures were complemented with new built-in joinery, materials and a colour narrative that gave the whole a fresh identity. This is a project about transformation through layers — colour, texture, light and detail. About the ability to draw out the potential of an existing space and give it a distinctive yet coherent character. Colour became the tool here. It is neither loud nor literal. It leads subtly and binds all the storeys into a single, consistent story. A tall plinth in a shade of burgundy is a bold, unexpected decorative device that builds rhythm and brings order to the space. It travels through the entrance vestibule, the living room and the staircase, up to the private zone of the upper floor. The palette of the house rests on five tones: burgundy, beige, pale blue, navy and sage. Each has its own place and purpose. Here the colours complement one another rather than compete. The entrance vestibule was treated as more than a pass-through. A wardrobe in pale-blue laminate with an integrated bench seat and a large-format mirror bring comfort and functionality right from the front door. Between the vestibule and the living room are sliding doors of patterned glass. The solution not only saves space but also filters the light, lending it softness and privacy.',
        'In the kitchen, the burgundy flows seamlessly from the corridor into the tall units, creating a strong presence within the interior. It corresponds with the sage-coloured joinery of a compact pantry, concealed behind the casing of the existing fireplace. It is an example of how colour can serve function: each zone has its own palette, which organises the space intuitively. The base cabinets are finished in wood-effect laminate with black and burgundy details. A worktop of beige engineered stone with a subtle pattern adds texture and echoes the terrazzo pattern of the large-format floor tiles. At the end of the kitchen run sits a small bar table — a place for quick breakfasts and conversation while cooking. In the living room, the fireplace was brought to the fore and dressed in glossy fluted ceramic tiles in sage. Their lustrous surface works beautifully with light — especially the indirect side lighting that builds atmosphere throughout the house. The new navy media wall forms a backdrop for a burgundy modular sofa in soft, cosy bouclé fabric. On the wall beside it hangs a retro display cabinet for glassware, with a small chest for a record player beneath it — a nod to analogue rituals. A beige rug with a bold texture completes the whole. In the second part of the living room, built-in cabinetry for books and decorative objects was designed, with a dining zone and a round table set beside it. Curtains of dark-beige faux silk fall softly at the windows, tempering the light and supporting the acoustics. The ground-floor bathroom is a bold juxtaposition. The shower zone features a deep-toned mosaic with a pronounced texture. The ceiling is painted burgundy and the walls are finished with tiled wainscoting in the same shade, its light grout underscoring the rhythm. A black vanity unit beneath a green washbasin and a round mirror complete the composition.',
        'Upstairs, the corridor gains wainscoting of burgundy \'éclair\'-profile panels, above which appears a light wallpaper with an abstract wave motif. It is a subtle transition between intensity and lightness. The main bathroom keeps the colour scheme coherent yet gains a new identity. Wallpaper with a motif of swimmers — the client\'s own inspiration — lends it a personal character. Elongated tiles, their fluting echoing the corridor panels, appear in shades of burgundy and navy; their long geometric pattern gently introduces rhythm and dynamism. A large mirror and individual wall sconces brighten the space. The bedroom was designed as a feminine oasis. Delicate floral wallpaper, curtains in satin-sheen corduroy, a navy upholstered headboard and a large oval mirror in a dark frame — all of it builds an atmosphere of intimacy and comfort. The bench at the foot of the bed serves a dual role: a comfortable place to sit and a storage compartment.',
      ],
    },
  },
  {
    id: '2',
    slug: 'delikatesy-dehesa',
    title: 'delikatesy dehesa',
    location: 'Wrocław',
    category: 'komercyjne',
    status: 'completed',
    year: 2023,
    area: '58 m²',
    scope: ['koncept miejsca', 'projekt wnętrz', 'projekty mebli', 'projekt lampy', 'projekt wykonawczy', 'identyfikacja wizualna', 'projekt uniformów'],
    thumbnail: '/images/dehesa/kool_dehesa_04.webp',
    featured: false,
    images: [
      '/images/dehesa/kool_dehesa_01.webp',  // 01 hero
      '/images/dehesa/kool_dehesa_02.webp',  // 02 square – row A left
      '/images/dehesa/kool_dehesa_03.webp',  // 03 portrait – row B left
      '/images/dehesa/kool_dehesa_04.webp',  // 04 square – row B right
      '/images/dehesa/kool_dehesa_05.webp',  // 05 square – row C left-top
      '/images/dehesa/kool_dehesa_06.webp',  // 06 portrait – row C right-bottom
      '/images/dehesa/kool_dehesa_07.webp',  // 07 square – row D right
      '/images/dehesa/kool_dehesa_08.webp',  // 08 square – row E left
      '/images/dehesa/kool_dehesa_09.webp',  // 09 portrait – row E right-offset
      '/images/dehesa/kool_dehesa_10.webp',  // 10 portrait – row F left
      '/images/dehesa/kool_dehesa_11.webp',  // 11 square – row F right
      '/images/dehesa/kool_dehesa_12.webp',  // 12 square – row G left
      '/images/dehesa/kool_dehesa_13.webp',  // 13 portrait – row H left
      '/images/dehesa/kool_dehesa_14.webp',  // 14 square – row H right
      '/images/dehesa/kool_dehesa_15.webp',  // 15 square – row I left
      '/images/dehesa/kool_dehesa_16.webp',  // 16 portrait – row I right
    ],
    photoCredit: 'Katarzyna Ramocka i Michał Woroniak | ZASOBY STUDIO',
    descriptionBlocks: [
      'W pełnym słońca wnętrzu emanującym ciepłem i autentycznością, można odnaleźć atmosferę tradycyjnych hiszpańskich delikatesów. Kolorystyka zaczerpnięta z filmów Almodovara, dodaje przestrzeni współczesnego charakteru. Projekt łączy barwy morskiego granatu, burgundu oraz żółci uzupełnione o mocne akcenty czerwieni nawiązujące do krajalnicy w oldschoolowym stylu widocznej od razu po wejściu. Każdy z kolorów odpowiada za poszczególne sekcje w sklepie i porządkuje przestrzeń. Wnętrze zdobi ponadczasowa jednolita posadzka z wykonanych na zamówienie płytek lastryko, których mieszanka kruszyw i kolorów została dobrana specjalnie na potrzeby projektu. Centrum deli, czyli ogromna lada, podkreślona ozdobnymi lampami zaprojektowanymi specjalnie dla tego wnętrza i wykonanymi przez wrocławskiego producenta oświetlenia. Czerwone łuki w połączeniu z delikatnymi, szklanymi kloszami w beżowym odcieniu i zwieńczone delikatną kulką dodają wnętrzu retro uroku.',
      'W nawiązaniu do tradycyjnych hiszpańskich sklepów, ściana za ladą została wykończona dekoracyjnymi płytkami z klasycznym biało-czarny wzorem. W jej centralnej części znajduje się neon prezentujący charakterystyczne cięcia wieprzowiny iberico, będące najważniejszą częścią oferty. Dalej, na stalowych relingach eksponowane są charakterystyczne dla Hiszpanii, długo dojrzewające szynki jamón. W zabudowie z drobnych, nieregularnych płytek w odcieniach beżu zaprojektowane zostały wnęki zastępujące tradycyjne sklepowe regały. Mieszczą się w nich wyselekcjonowane octy balsamiczne, oliwy, wina oraz inne specjały, uzupełniające ofertę z lady. Na tyłach sklepu, w strefie zaakcentowanej burgundowym kolorem znajduje się dział z wysokiej jakości mrożonymi produktami oraz niewielki aneks biurowy. Zabieg kolorystycznego odcięcia pozwolił na optyczne skrócenie podłużnego wnętrza. Ze względu na pobliski parking oraz mocne nasłonecznienie, przed witryną stanął drewniany regał w miodowym odcieniu, który pełni funkcję wizytówki miejsca oraz osłony przed nadmiernym słońcem. Wykonany z dbałością o szczegóły, dzięki odpowiednim frezowaniom pozwala na regulację ilości drewnianych żaluzji w zależności od potrzeb.',
      'Dopełnieniem konceptu był projekt identyfikacji wizualnej zachowujący paletę kolorystyczną nawiązującą do wnętrza. Logotyp przywodzi na myśl klasyczne hiszpańskie szyldy i został uzupełniony o szereg prostych ilustracji odnoszących się do głównych produktów z oferty deli. Motyw neonu świni został przeniesiony w formie grafiki na elementy drukowane. Uniformy, czyli granatowe koszulki w połączeniu z burgundowymi fartuchami wykończonymi delikatnym, skórzanym akcentem i żółtym haftem współgrają z wnętrzem sklepu.',
    ],
    description: 'Projekt wnętrz delikatesów iberyjskich we Wrocławiu. Przestrzeń łączy surowe materiały — terrazzo, ciemną stolarkę i czerwone akcenty — z ciepłem drewna i rzemieślniczym charakterem produktów. Całość dopełnia autorska identyfikacja wizualna.',
    caseStudy: {
      problem: 'Podłużne, mocno nasłonecznione wnętrze miało oddać atmosferę tradycyjnych hiszpańskich delikatesów i uporządkować ofertę sklepu.',
      decisions: [
        'Kolorystyka morskiego granatu, burgundu i żółci przypisuje każdą sekcję sklepu do osobnej barwy i porządkuje przestrzeń.',
        'Ozdobne lampy i posadzkę z lastryko wykonano na zamówienie specjalnie dla tego wnętrza.',
        'Burgundowa strefa na tyłach optycznie skraca podłużne wnętrze.',
        'Drewniany regał w witrynie pełni funkcję wizytówki miejsca i osłony przed nadmiernym słońcem.',
        'Autorska identyfikacja wizualna i uniformy zachowują paletę wnętrza.',
      ],
      result: 'Koncept dopełniły autorska identyfikacja wizualna i uniformy, które współgrają z wnętrzem, spinając całość w jedną, spójną paletę.',
    },
    en: {
      title: 'dehesa delicatessen',
      scope: ['venue concept', 'interior design', 'furniture design', 'lamp design', 'construction design', 'visual identity', 'uniform design'],
      description: 'Interior design for an Iberian delicatessen in Wrocław. The space combines raw materials — terrazzo, dark joinery and red accents — with the warmth of wood and the artisanal character of the produce. A bespoke visual identity completes the whole.',
      caseStudy: {
        problem: 'An elongated, strongly sunlit interior had to evoke the atmosphere of a traditional Spanish delicatessen and bring order to the shop\'s offering.',
        decisions: [
          'A palette of sea navy, burgundy and yellow marks out each section of the shop and brings order to the space.',
          'The decorative lamps and the terrazzo floor were custom-made especially for this interior.',
          'A burgundy zone at the back visually shortens the elongated interior.',
          'A wooden rack in the shop window serves as the venue\'s calling card and a screen against excessive sun.',
          'A bespoke visual identity and uniforms keep to the interior\'s palette.',
        ],
        result: 'The concept was completed by a visual identity and uniforms that harmonise with the interior, drawing the whole together into one cohesive palette.',
      },
      descriptionBlocks: [
        'In a sun-filled interior radiating warmth and authenticity, one finds the atmosphere of a traditional Spanish delicatessen. A colour palette drawn from Almodóvar\'s films lends the space a contemporary character. The design combines sea navy, burgundy and yellow, complemented by strong red accents that echo the old-school slicer visible right from the entrance. Each colour marks out a different section of the shop and brings order to the space. The interior is graced by a timeless, uniform floor of custom-made terrazzo tiles, their mix of aggregates and colours composed specifically for this project. The heart of the deli — a vast counter — is accentuated by decorative lamps designed especially for this interior and made by a Wrocław lighting manufacturer. Red arches paired with delicate beige glass shades, each crowned with a small sphere, lend the interior a retro charm.',
        'In a nod to traditional Spanish shops, the wall behind the counter is finished with decorative tiles in a classic black-and-white pattern. At its centre hangs a neon sign depicting the characteristic cuts of iberico pork — the most important part of the offering. Further along, Spain\'s signature long-cured jamón hams are displayed on steel rails. Niches designed within a built-in unit clad in small, irregular tiles in shades of beige take the place of conventional shop shelving. They hold carefully selected balsamic vinegars, olive oils, wines and other specialities that complement the offering at the counter. At the back of the shop, in a zone accented in burgundy, there is a section with high-quality frozen products and a small office nook. This colour break visually shortens the elongated interior. Owing to the nearby car park and strong sunlight, a honey-toned wooden rack stands in front of the shop window, serving both as the venue\'s calling card and as a screen against excessive sun. Crafted with attention to detail, its precise milled grooves allow the number of wooden louvres to be adjusted as needed.',
        'The concept was completed with a visual identity that keeps to a colour palette echoing the interior. The logotype recalls classic Spanish shop signs and is accompanied by a series of simple illustrations referencing the deli\'s principal products. The pig motif from the neon sign was carried over as a graphic onto printed materials. The uniforms — navy T-shirts paired with burgundy aprons finished with a subtle leather accent and yellow embroidery — harmonise with the shop\'s interior.',
      ],
    },
  },
  {
    id: '7',
    slug: 'mieszkanie-widmo',
    title: 'mieszkanie',
    location: 'Wrocław',
    category: 'mieszkalne',
    status: 'completed',
    year: 2022,
    area: '58 m²',
    scope: ['projekt koncepcyjny wnętrz', 'projekty mebli', 'projekt wykonawczy wnętrz', 'nadzór autorski'],
    thumbnail: '/images/mieszkanie-widmo/KOOL_m_00_MAIN.webp',
    featured: false,
    images: [
      '/images/mieszkanie-widmo/KOOL_m_00_01.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_02.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_03.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_04.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_05.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_06.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_07.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_08.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_09.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_10.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_11.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_12.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_13.webp',
      '/images/mieszkanie-widmo/KOOL_m_00_14.webp',
    ],
    fullWidthIndices: [8, 11],
    containedPairs: [{ indices: [4, 5], labels: ['przed', 'po'], scale: 0.75, aspect: 'aspect-[3764/2484]' }],
    reverseLastRow: true,
    descriptionBlocks: [
      'Projekt mieszkania zakładał odejście od pierwotnego, bardziej podzielonego układu na rzecz otwartej, płynnie przenikającej się przestrzeni. Zredukowanie zbędnych ścian pozwoliło wydobyć naturalne światło i stworzyć czytelną, funkcjonalną strefę dzienną, w której salon, jadalnia i kuchnia budują spójną, ponadczasową całość. Bazę aranżacji tworzą jasne, ciepłe tonacje oraz duże ilości naturalnego drewna, obecnego w zabudowach stolarskich i na podłogach. Miękkie tkaniny, proste formy mebli i subtelne detale nadają wnętrzu komfortowy charakter. Kolorowe lastryko wprowadza delikatną dynamikę i stanowi motyw przewodni, który przeszywa przestrzeń — od holu po łazienkę. Wyrazistym akcentem są turkusowe płytki pojawiające się na zabudowie szafy w holu oraz na obudowie kominka w strefie dziennej, a także ceglana zabudowa prowadząca z holu do kuchni. W części kuchennej klasyczny marmur Bianco Carrara zastosowany na blatach i zabudowie ściennej równoważy kolorystyczne akcenty i podkreśla ponadczasowy charakter projektu. Efektowne, przesuwne drzwi ze szkła ornamentowego w pionowym profilu oddzielają sypialnię, zapewniając prywatność przy jednoczesnym zachowaniu dostępu światła. Sama sypialnia została zaprojektowana jako przestrzeń wyciszenia — z dużą garderobą w energetycznym kolorze, która stanowi mocny, ale harmonijny akcent. Łazienka konsekwentnie rozwija przyjętą prostą materiałową: kolorowe lastryko, kamień, ceglana szafka pod umywalkę, drewniana zabudowa oraz kwadratowe płytki w szafkowym odcieniu. Spójność materiałów i dbałość o detal budują wnętrze nowoczesne, lecz odporne na zmieniające się trendy — ciepłe, funkcjonalne i ponadczasowe.',
    ],
    description: 'Projekt mieszkania zakładał odejście od podzielonego układu na rzecz otwartej, płynnie przenikającej się przestrzeni. Kolorowe lastryko, turkusowe płytki i marmur Bianco Carrara tworzą ciepłe, ponadczasowe wnętrze.',
    caseStudy: {
      problem: 'Pierwotny, mocno podzielony układ mieszkania trzeba było otworzyć na płynnie przenikającą się przestrzeń.',
      decisions: [
        'Redukcja zbędnych ścian wydobyła naturalne światło i stworzyła czytelną strefę dzienną łączącą salon, jadalnię i kuchnię.',
        'Kolorowe lastryko poprowadzono jako motyw przewodni przeszywający przestrzeń od holu po łazienkę.',
        'Turkusowe płytki i ceglana zabudowa wprowadzają wyraziste akcenty, a marmur Bianco Carrara je równoważy.',
        'Przesuwne drzwi ze szkła ornamentowego oddzielają sypialnię, zapewniając prywatność bez odcinania światła.',
      ],
      result: 'Spójność materiałów i dbałość o detal zbudowały wnętrze ciepłe, funkcjonalne i ponadczasowe — nowoczesne, lecz odporne na zmieniające się trendy.',
    },
    en: {
      title: 'apartment',
      scope: ['interior conceptual design', 'furniture design', 'interior construction design', 'author\'s supervision'],
      description: 'The apartment design moved away from a compartmentalised layout in favour of an open, fluidly interconnecting space. Colourful terrazzo, turquoise tiles and Bianco Carrara marble create a warm, timeless interior.',
      caseStudy: {
        problem: 'The apartment\'s original, heavily compartmentalised layout had to be opened up into a fluidly interconnecting space.',
        decisions: [
          'Removing redundant walls drew in natural light and created a legible living zone joining the living room, dining area and kitchen.',
          'Colourful terrazzo runs through the interior as a leitmotif, from the hall to the bathroom.',
          'Turquoise tiles and brick-red joinery add bold accents, balanced by Bianco Carrara marble.',
          'Sliding doors of patterned glass separate the bedroom, ensuring privacy without cutting off the light.',
        ],
        result: 'Material coherence and attention to detail produced a warm, functional and timeless interior — contemporary yet resistant to shifting trends.',
      },
      descriptionBlocks: [
        'The design for this apartment moved away from the original, more compartmentalised layout in favour of an open, fluidly interconnecting space. Removing redundant walls drew in natural light and created a legible, functional living zone in which the living room, dining area and kitchen form a coherent, timeless whole. The scheme is grounded in light, warm tones and generous amounts of natural wood, present in the built-in joinery and on the floors. Soft fabrics, simple furniture forms and subtle details lend the interior a comfortable character. Colourful terrazzo introduces a gentle dynamism and serves as the leitmotif threading through the space — from the hall to the bathroom. Turquoise tiles provide a bold accent, appearing on the built-in wardrobe in the hall and on the fireplace surround in the living zone, as does the brick-red joinery leading from the hall into the kitchen. In the kitchen, classic Bianco Carrara marble on the worktops and wall cladding balances the colour accents and underscores the timeless character of the design. Striking sliding doors of vertically reeded glass separate the bedroom, ensuring privacy while still admitting light. The bedroom itself was conceived as a space of calm — with a large wardrobe in an energising colour that forms a strong yet harmonious accent. The bathroom consistently extends the established material palette: colourful terrazzo, stone, a brick-red washbasin cabinet, wooden joinery and square tiles in a sage shade. Material coherence and attention to detail build an interior that is contemporary yet resistant to shifting trends — warm, functional and timeless.',
      ],
    },
  },
  {
    id: '3',
    slug: 'winobar-lodz',
    title: 'winobar',
    location: 'Łódź',
    category: 'komercyjne',
    status: 'completed',
    year: 2024,
    area: '311 m²',
    scope: ['projekt koncepcyjny wnętrz', 'food concept'],
    thumbnail: '/images/winobar-lodz/KOOL_www_prs_wersja01_main.webp',
    featured: false,
    meta: {
      collaboration: 'blsk.studio',
      visualizations: 'Michał Sokołowski',
    },
    // Display order (board): hero, [02 + text], [03 full], [04 padded + 05]
    images: [
      '/images/winobar-lodz/KOOL_www_prs_wersja01_01.webp', // 01 hero – hokery przy barze
      '/images/winobar-lodz/KOOL_www_prs_wersja01_02.webp', // 02 square – bar z ekspresem i kolekcją win (text right)
      '/images/winobar-lodz/KOOL_www_prs_wersja01_03.webp', // 03 full-width – sala z ceglanym sklepieniem
      '/images/winobar-lodz/KOOL_www_prs_wersja01_04.webp', // 04 portrait – loże pod lampami, row left (padded)
      '/images/winobar-lodz/KOOL_www_prs_wersja01_05.webp', // 05 square – sala ze sceną jazzową, row right (flush)
    ],
    fullWidthIndices: [2],
    flipRowParity: true,
    textRows: [{ row: 0, side: 'right' }],
    descriptionBlocks: [
      'Projekt wnętrza powstał z poszanowaniem postindustrialnego charakteru istniejącego budynku, którego największym atutem jest zachowany ceglany sufit nadający przestrzeni wyjątkowy rytm. Historyczna tkanka stanowi tło dla współczesnej aranżacji, opartej na wyrazistych akcentach kolorystycznych i świadomie budowanej atmosferze. Centralnym elementem jest bar, zaakcentowany intensywnym odcieniem oranżu, który przyciąga uwagę gości już od wejścia. Eksponowane kolekcje win stają się integralną częścią wystroju, budując tożsamość miejsca. Projekt opiera się na równowadze pomiędzy otwartością a kameralnością, gdzie gastronomia, wino i architektura tworzą spójną opowieść o wspólnym doświadczaniu.',
    ],
    description: 'Winobar w postindustrialnym wnętrzu w centrum Łodzi. Zachowany ceglany sufit spotyka intensywny oranż baru, a eksponowane kolekcje win budują tożsamość miejsca. Projekt powstał we współpracy z blsk.studio.',
    caseStudy: {
      problem: 'Wnętrze powstawało w istniejącym, postindustrialnym budynku, którego największym atutem jest zachowany ceglany sufit nadający przestrzeni wyjątkowy rytm.',
      decisions: [
        'Projekt poprowadzono z poszanowaniem historycznej tkanki, która stała się tłem dla współczesnej aranżacji.',
        'Centralny bar zaakcentowano intensywnym odcieniem oranżu, przyciągającym uwagę już od wejścia.',
        'Eksponowane kolekcje win uczyniono integralną częścią wystroju, budującą tożsamość miejsca.',
      ],
      result: 'Projekt opiera się na równowadze między otwartością a kameralnością, w której gastronomia, wino i architektura tworzą spójną opowieść o wspólnym doświadczaniu.',
    },
    en: {
      title: 'wine bar',
      scope: ['interior conceptual design', 'food concept'],
      description: 'A wine bar in a post-industrial interior in the centre of Łódź. The preserved brick ceiling meets the intense orange of the bar, while displayed wine collections build the identity of the place. Designed in collaboration with blsk.studio.',
      caseStudy: {
        problem: 'The interior took shape in an existing post-industrial building whose greatest asset is the preserved brick ceiling that gives the space a distinctive rhythm.',
        decisions: [
          'The design was led with respect for the historic fabric, which became a backdrop for a contemporary arrangement.',
          'The central bar was accented in an intense shade of orange that draws attention from the moment guests enter.',
          'Displayed wine collections were made an integral part of the décor, building the identity of the place.',
        ],
        result: 'The design rests on a balance between openness and intimacy, where gastronomy, wine and architecture form a coherent story of shared experience.',
      },
      descriptionBlocks: [
        'The interior was designed with respect for the post-industrial character of the existing building, whose greatest asset is the preserved brick ceiling, lending the space a distinctive rhythm. The historic fabric forms a backdrop for a contemporary arrangement built on bold colour accents and a deliberately crafted atmosphere. The centrepiece is the bar, accented in an intense shade of orange that draws guests\' attention from the moment they enter. Displayed wine collections become an integral part of the décor, building the identity of the place. The design rests on a balance between openness and intimacy, where gastronomy, wine and architecture form a coherent story of shared experience.',
      ],
    },
  },
  {
    id: '4',
    slug: 'pawilon-fandom',
    title: 'pawilon usługowy Fandom',
    location: 'Wrocław',
    category: 'komercyjne',
    status: 'in_progress',
    year: 2026,
    area: '1140 m²',
    scope: ['projekt koncepcyjny wnętrz', 'projekty mebli', 'projekt wykonawczy wnętrz', 'nadzór autorski'],
    thumbnail: '/images/pawilon-fandom/kool_fnd_www_main.webp',
    featured: false,
    meta: {
      collaboration: 'Jord Studio, blsk.studio, arch_it',
    },
    // Display order (board): hero, [9:16 site reel + status text]
    images: [
      '/images/pawilon-fandom/kool_fnd_www_01.webp', // 01 hero – elewacja pawilonu, okrągłe okna (kadr 16:9)
    ],
    // Index counts the hero (0); the reel occupies the row-0 slot
    reel: { src: '/videos/pawilon-fandom-reel.mp4', index: 1, aspect: 'aspect-[2/3]' },
    textRows: [{ row: 0, side: 'right', align: 'start' }],
    descriptionBlocks: [
      'Rewitalizacja modernistycznego pawilonu jest obecnie w realizacji.\nGdy budowa dobiegnie końca, odsłonimy wszystkie detale.',
    ],
    description: 'Rewitalizacja modernistycznego pawilonu usługowego w centrum Wrocławia, obecnie w realizacji. Gdy budowa dobiegnie końca, odsłonimy wszystkie detale.',
    en: {
      title: 'Fandom service pavilion',
      scope: ['interior conceptual design', 'furniture design', 'interior construction design', 'author\'s supervision'],
      description: 'Revitalisation of a modernist service pavilion in the centre of Wrocław, currently underway. Once the building works are complete, we will reveal all the details.',
      descriptionBlocks: [
        'The revitalisation of this modernist pavilion is currently underway.\nOnce the building works are complete, we will reveal all the details.',
      ],
    },
  },
  {
    id: '5',
    slug: 'hotel-belmonte',
    title: 'hotel Belmonte',
    location: 'Ustronie Morskie',
    category: 'komercyjne',
    status: 'in_progress',
    year: 2026,
    area: '7 100 m²',
    scope: ['projekt koncepcyjny wnętrz', 'projekty mebli', 'projekty oświetlenia', 'projekt wykonawczy wnętrz', 'nadzór autorski'],
    thumbnail: '/images/hotel-belmonte/kool_belmonte_main.webp',
    featured: true,
    meta: {
      title: '4-gwiazdkowy hotel Belmonte',
      collaboration: 'BUCK.STUDIO',
    },
    // Display order (board): hero, [9:16 site reel + status text]. The reel
    // is the kool.studio Instagram construction reel (first 5s trimmed off).
    images: [
      '/images/hotel-belmonte/kool_belmonte_01.webp', // 01 hero – budowa, okrągłe okno (kadr 16:9)
    ],
    // Index counts the hero (0); the reel occupies the row-0 slot
    reel: { src: '/videos/hotel-belmonte-reel.mp4', index: 1, aspect: 'aspect-[2/3]' },
    textRows: [{ row: 0, side: 'right', align: 'start' }],
    descriptionBlocks: [
      'Projekt 4-gwiazdkowego hotelu w Ustroniu Morskim jest obecnie w realizacji.\nGdy budowa dobiegnie końca, odsłonimy wszystkie detale.',
    ],
    description: 'Projekt 4-gwiazdkowego hotelu w Ustroniu Morskim, obecnie w realizacji. Gdy budowa dobiegnie końca, odsłonimy wszystkie detale.',
    en: {
      meta: { title: '4-star hotel Belmonte' },
      scope: ['interior conceptual design', 'furniture design', 'lighting design', 'interior construction design', 'author\'s supervision'],
      description: 'A design for a 4-star hotel in Ustronie Morskie, currently underway. Once the building works are complete, we will reveal all the details.',
      descriptionBlocks: [
        'The design for this 4-star hotel in Ustronie Morskie is currently underway.\nOnce the building works are complete, we will reveal all the details.',
      ],
    },
  },
  {
    id: '6',
    slug: 'kancelaria',
    title: 'kancelaria',
    location: 'Wrocław',
    category: 'komercyjne',
    status: 'completed',
    year: 2026,
    area: '50 m²',
    scope: ['projekt koncepcyjny wnętrz', 'projekty mebli', 'projekt wykonawczy wnętrz', 'nadzór autorski'],
    thumbnail: '/images/kancelaria/KOOL_kancelaria_MAIN.webp',
    featured: false,
    // Display order (board): hero, [02 + text], [reel + 04], [slider + 06],
    // [07 + 08], [09 + 10], [11 + 12], [13 + 14], [15 + 16]. The 05A/05B
    // before/after pair lives in the slider, not the images array.
    images: [
      '/images/kancelaria/KOOL_kancelaria01.webp',  // 01 hero – biurko, regał, okno
      '/images/kancelaria/KOOL_kancelaria02.webp',  // 02 square – regał z czerwoną misą (text right)
      '/images/kancelaria/KOOL_kancelaria04.webp',  // 04 – niebieska grafika, stół, krzesła Rey (reel to its left)
      '/images/kancelaria/KOOL_kancelaria06.webp',  // 06 – półka z segregatorami przy oknie (slider to its left)
      '/images/kancelaria/KOOL_kancelaria07.webp',  // 07 – szklana misa na parapecie
      '/images/kancelaria/KOOL_kancelaria08.webp',  // 08 square – detal stołu z lastryko
      '/images/kancelaria/KOOL_kancelaria09.webp',  // 09 – biurko z różową zabudową
      '/images/kancelaria/KOOL_kancelaria10.webp',  // 10 – wazon na blacie z lastryko
      '/images/kancelaria/KOOL_kancelaria11.webp',  // 11 – narożnik z żółtą komodą i grafiką
      '/images/kancelaria/KOOL_kancelaria12.webp',  // 12 square – detal niebieskiej lampy
      '/images/kancelaria/KOOL_kancelaria13.webp',  // 13 – biurko, okno, grafika ze żmiją
      '/images/kancelaria/KOOL_kancelaria14.webp',  // 14 – niebieska grafika na ścianie
      '/images/kancelaria/KOOL_kancelaria15.webp',  // 15 – dwie szklane kule pod sufitem
      '/images/kancelaria/KOOL_kancelaria16.webp',  // 16 – regał z rośliną i czerwoną misą
    ],
    // Indices count the hero (0) and each inserted slot (reel 2, slider 4)
    reel: { src: '/videos/kancelaria-reel.mp4', index: 2 },
    slider: {
      beforeSrc: '/images/kancelaria/KOOL_kancelaria05B.webp', // przed – stary gabinet
      afterSrc: '/images/kancelaria/KOOL_kancelaria05A.webp',  // po – nowa aranżacja
      labels: ['przed', 'po'],
      index: 4,
    },
    textRows: [{ row: 0, side: 'right' }],
    portraitIndices: [3, 8, 12, 15],
    descriptionBlocks: [
      'Już od pierwszego kontaktu z przestrzenią wiedzieliśmy, że jej potencjał kryje się w uproszczeniu. Projekt tej kancelarii potraktowaliśmy jako proces porządkowania: funkcji i formy. Bazą stała się neutralna paleta bieli i beżu, pozwalająca wyciszyć przestrzeń i stworzyć eleganckie, ponadczasowe tło. Wprowadziliśmy subtelne, ale zdecydowane akcenty kolorystyczne, które nadają wnętrzu charakteru, nie zaburzając jego profesjonalnego tonu. Jednym z najważniejszych rozwiązań w projekcie jest ukrycie rozbudowanej strefy przechowywania za miękką, lnianą zasłoną. Rozwiązanie to porządkuje wizualnie przestrzeń, a jednocześnie buduje dużą, spokojną płaszczyznę, która wycisza wnętrze i nadaje mu rytm. Tkanina pochłania dźwięk, łagodząc akustykę i sprzyjając skupieniu. Pracuje też ze światłem, delikatnie je filtrując i uszlachetniając wnętrze. Centralnym punktem przestrzeni jest zaprojektowany przez nas stół. Połączenie stali nierdzewnej z blatem z drewnianego lastryko stanowi wyważony dialog między precyzją a materią. Towarzyszą mu odnowione krzesła Rey i charakterystyczna lampa Lexavala. Kluczową rolę w kształtowaniu charakteru wnętrza odegrał odnowiony parkiet drewniany, zachowany jako element tożsamości miejsca. Ociepla i scala wszystkie elementy w spójną całość. System stalowych regałów zawieszony na ścianie pozwala na selektywną ekspozycję. W efekcie powstała przestrzeń łącząca nowoczesną elegancję z poczuciem ciepła, uporządkowana i czytelna, a przy tym budująca zaufanie już od pierwszego spojrzenia.',
    ],
    description: 'Kameralna kancelaria we Wrocławiu, w której projekt stał się procesem porządkowania funkcji i formy. Neutralna paleta bieli i beżu, lniana zasłona skrywająca strefę przechowywania oraz autorski stół z blatem z drewnianego lastryko budują nowoczesną elegancję z poczuciem ciepła.',
    caseStudy: {
      problem: 'Potencjał tej kameralnej kancelarii krył się w uproszczeniu — projekt potraktowaliśmy jako proces porządkowania funkcji i formy.',
      decisions: [
        'Neutralna paleta bieli i beżu wycisza przestrzeń i tworzy ponadczasowe tło.',
        'Rozbudowaną strefę przechowywania ukryto za miękką, lnianą zasłoną, która porządkuje wnętrze, pochłania dźwięk i filtruje światło.',
        'Autorski stół ze stali nierdzewnej z blatem z drewnianego lastryko stał się centralnym punktem wnętrza.',
        'Odnowiony parkiet zachowano jako element tożsamości miejsca, a stalowe regały na ścianie pozwalają na selektywną ekspozycję.',
      ],
      result: 'Powstała przestrzeń uporządkowana i czytelna, łącząca nowoczesną elegancję z poczuciem ciepła i budująca zaufanie już od pierwszego spojrzenia.',
    },
    en: {
      title: 'law office',
      scope: ['interior conceptual design', 'furniture design', 'interior construction design', 'author\'s supervision'],
      description: 'An intimate law office in Wrocław, where the design became a process of ordering function and form. A neutral palette of whites and beiges, a linen curtain concealing the storage zone and a bespoke table with a wood terrazzo top build modern elegance with a sense of warmth.',
      caseStudy: {
        problem: 'The potential of this intimate law office lay in simplification — we approached the design as a process of ordering function and form.',
        decisions: [
          'A neutral palette of whites and beiges calms the space and creates a timeless backdrop.',
          'The extensive storage zone was concealed behind a soft linen curtain that orders the interior, absorbs sound and filters the light.',
          'A bespoke table of stainless steel with a wood terrazzo top became the centrepiece of the interior.',
          'The restored parquet was preserved as an element of the place\'s identity, while wall-mounted steel shelving allows for selective display.',
        ],
        result: 'The result is an ordered, legible space that combines modern elegance with a sense of warmth and builds trust from the very first glance.',
      },
      descriptionBlocks: [
        'From our very first encounter with the space we knew that its potential lay in simplification. We approached the design of this law office as a process of ordering: of function and of form. A neutral palette of whites and beiges became the base, calming the space and creating an elegant, timeless backdrop. We introduced subtle yet decisive colour accents that lend the interior character without disturbing its professional tone. One of the most important moves in the design is the concealment of the extensive storage zone behind a soft linen curtain. This move visually orders the space while building a large, calm plane that quiets the interior and gives it rhythm. The fabric absorbs sound, softening the acoustics and aiding concentration. It also works with the light, gently filtering it and refining the interior. The centrepiece of the space is a table of our own design. The pairing of stainless steel with a wood terrazzo top forms a balanced dialogue between precision and matter. It is accompanied by restored Rey chairs and a distinctive Lexaval lamp. A key role in shaping the interior\'s character is played by the restored wooden parquet, preserved as an element of the place\'s identity. It warms and binds all the elements into a coherent whole. A system of steel shelving mounted on the wall allows for selective display. The result is a space that combines modern elegance with a sense of warmth — ordered and legible, and one that builds trust from the very first glance.',
      ],
    },
  },
  {
    id: '8',
    slug: 'biblioteka-gdansk',
    title: 'biblioteka',
    location: 'Gdańsk',
    category: 'komercyjne',
    status: 'completed',
    year: 2025,
    area: '850 m²',
    scope: ['koncept miejsca', 'projekt wnętrz', 'projekty mebli', 'projekt lamp'],
    thumbnail: '/images/biblioteka-gdansk/kool_biblioteka_gdansk_MAIN.webp',
    featured: false,
    meta: {
      title: 'Wojewódzka i miejska biblioteka publiczna im. Josepha Conrada Korzeniowskiego - Konkurs na opracowanie projektu koncepcyjnego architektury wnętrz',
      location: 'Gdańsk, Targ Rakowy 5/6',
      collaboration: 'blsk.studio',
    },
    images: [
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_01.webp',  // 01 hero – mediateka
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_02.webp',  // 02 square – lada recepcyjna, row 0 left (intro text right)
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_03.webp',  // 03 full-width – paleta materiałowa
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_05a.webp', // 05a czytelnia – slider pair (aranżacja 1)
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_05b.webp', // 05b czytelnia – slider pair (aranżacja 2)
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_06.webp',  // 06 square – strefa zielona (colors text left)
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_07.webp',  // 07 square – sala cichej pracy (reel right)
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_09.webp',  // 09 full-width – parter, strefa wejściowa
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_10.webp',  // 10 square – aksonometria parteru (parter text right)
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_11.webp',  // 11 full-width – biblioteka dla dzieci
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_12.webp',  // 12 square – mediateka young adult
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_13.webp',  // 13 portrait – aksonometria biblioteki dla dzieci
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_14.webp',  // 14 full-width – strefa biurowa
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_15.webp',  // 15 square – pokój socjalny (piętro text left)
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_16.webp',  // 16 square – pomieszczenie biurowe
      '/images/biblioteka-gdansk/kool_biblioteka_gdansk_17.webp',  // 17 portrait – aksonometria piętra
    ],
    // Indices below count the hero (0) and the reel slot (7)
    fullWidthIndices: [2, 8, 10, 13],
    containedPairs: [{ indices: [3, 4], labels: ['aranżacja 1', 'aranżacja 2'], aspect: 'aspect-[2560/1440]' }],
    reverseLastRow: true,
    reel: { src: '/videos/biblioteka-gdansk-reel.mp4', index: 7 },
    textRows: [
      { row: 0, side: 'right' },
      { row: 3, side: 'left' },
      { row: 6, side: 'right' },
      { row: 10, side: 'left' },
    ],
    descriptionBlocks: [
      'Głównym celem, który przyświecał nam podczas projektowania wnętrz pierwszego piętra oraz parteru budynku przy Targu Rakowym 5/6 w Gdańsku, było stworzenie przestrzeni inkluzywnych, otwartych i nieonieśmielających, miejsc dostępnych dla wszystkich użytkowników, bez względu na wiek, potrzeby czy sposób korzystania z biblioteki. Kluczowa była dla nas elastyczność: zarówno funkcjonalna, umożliwiająca realizację obecnych zadań biblioteki, jak i przyszłościowa, pozwalająca na płynne dostosowanie się do nowych aktywności, sposobów pracy i form uczestnictwa. Aby osiągnąć ten cel, oparliśmy koncept na świadomym wykorzystaniu teorii barw i ich oddziaływania — to właśnie kolor stał się fundamentem spójności wizualnej oraz emocjonalnej całego projektu. W projektowaniu wnętrz kolor nie pełni jedynie roli estetycznej — jest jednym z kluczowych środków oddziaływania na percepcję, samopoczucie i funkcjonowanie użytkowników. Teoria barw opisuje relacje między kolorami, ich wpływ na odbiór przestrzeni oraz psychofizyczne reakcje, jakie wywołują. Odpowiednio dobrana paleta może wspierać koncentrację, wyciszać, pobudzać, porządkować przestrzeń lub kierować ruchem. W bibliotece, jako miejscu łączącym różnorodne aktywności, od pracy i nauki, przez rekreację, po spotkania i wydarzenia, kolor staje się sprzymierzeńcem w budowaniu nastroju, funkcjonalnego podziału oraz intuicyjności wnętrza. Na tej podstawie wybraliśmy trzy barwy przewodnie o silnych, a jednocześnie komplementarnych właściwościach: ceglany, zielony i niebieski. Każdy z nich niesie inne znaczenia, wspiera odmienny typ aktywności oraz współtworzy charakter miejsca. Zestawienie tych barw pozwala nastrojowo różnicować przestrzenie, a jednocześnie zachować całościową, harmonijną identyfikację.',
      'Kolor ceglany: Ceglany wprowadza do wnętrza ciepło, przytulność i poczucie bliskości. Sprzyja relaksowi i budowaniu kameralnej atmosfery, zachęca do spokojnych interakcji i daje wrażenie naturalności. Kojarzy się z autentycznością, ziemią i tradycyjnymi wartościami, dzięki czemu tworzy przyjazne otoczenie. Kolor niebieski: Niebieski nadaje przestrzeni świeżość, harmonię i uczucie oddechu. Koi emocje, sprzyja koncentracji i wspiera myślenie logiczne, tworząc idealne warunki do pracy umysłowej. Budzi zaufanie i poczucie stabilności, wprowadzając nowoczesny i profesjonalny charakter. Kolor zielony: Zielony działa kojąco i harmonizująco, pozwala wzrokowi odpocząć i tworzy atmosferę spokoju. Sprzyja skupieniu i łagodnie porządkuje przestrzeń, nie narzucając się użytkownikowi. Jako kolor związany z naturą wprowadza do wnętrza świeżość, autentyczność i poczucie równowagi. Wybrana paleta — ceglany, zielony i niebieski — tworzy razem wielowymiarowy język wizualny, który wspiera ideę biblioteki jako przestrzeni otwartej, przyjaznej i elastycznej. Każdy z kolorów pełni określoną funkcję, odpowiada na potrzeby różnych grup użytkowników i typów aktywności. Dzięki świadomej pracy z barwą powstaje wnętrze, które nie tylko spełnia wymagania funkcjonalne, ale przede wszystkim buduje doświadczenie — spokojne, bezpieczne, inspirujące i dostępne dla wszystkich.',
      'Parter pełni rolę reprezentacyjnej i najbardziej dostępnej części biblioteki, dlatego zaplanowaliśmy go jako przestrzeń otwartą, czytelną i przyjazną już od pierwszego kroku. W strefie wejściowej zastosowaliśmy ceglany kolor przewodni, którego ciepło i naturalność budują atmosferę gościnności oraz przełamują formalność typową dla instytucji publicznych. Kolor ten wzmacnia poczucie bliskości i tworzy komfortowy próg wejścia dla użytkowników. Centralnie, na wprost drzwi, znajduje się okrągła lada recepcyjna, która organizuje ruch i stanowi pierwszy punkt kontaktu. Jej forma jest inkluzywna i dostępna z każdej strony, a miękkie, obłe kształty wpisują się w założenie nieonieśmielającej przestrzeni. Bezpośrednio za ladą umieszczono donicę z bujną roślinnością, wprowadzającą element natury i tworzącą wizualny akcent, który łagodzi odbiór przestrzeni wejściowej. Wokół tej centralnej części rozmieszczono ławki, oferujące chwilę odpoczynku; im głębiej wchodzimy w przestrzeń parteru, tym siedziska stają się coraz bardziej miękkie i zachęcające do dłuższego pobytu. Po prawej stronie od recepcji zlokalizowana jest sala cichej pracy, w której zastosowaliśmy kolor przewodni niebieski — sprzyjający koncentracji, skupieniu i kreatywności. Przestrzeń ta może pełnić również funkcję salki konferencyjnej lub sali spotkań, dzięki wyposażeniu umożliwiającemu łatwą adaptację do różnych potrzeb. Po lewej stronie od wejścia znajduje się strefa czytelni, utrzymana w zielonej palecie barw. To przestrzeń spokojna, naturalna i elastyczna. Wykorzystaliśmy tu transparentne zasłony, które pozwalają subtelnie wydzielać mniejsze, bardziej kameralne strefy bez utraty lekkości i przepuszczalności światła. Czytelnia wyposażona jest w sofki oraz stanowiska do pracy przy długim blacie pod oknami. Wszystkie pozostałe meble są mobilne, co umożliwia szybkie i wygodne przearanżowanie przestrzeni — nawet pod większe wydarzenia kulturalne. Zwieńczeniem strefy jest wysoki regał, pełniący funkcję tła dla prelekcji, rozmów i spotkań, a jednocześnie porządkujący przestrzeń wizualnie.',
      'Piętro biblioteki zostało podzielone na dwie wyraźne strefy funkcjonalne, odpowiadające różnym grupom użytkowników oraz ich potrzebom. Projekt zakłada stworzenie przestrzeni elastycznych, przyjaznych i sprzyjających zarówno pracy, jak i odpoczynkowi, a także zapewnienie odpowiedniego zaplecza dla pracowników. W prawym skrzydle ulokowana została mediateka młodzieżowa, w której głównym kolorem przewodnim jest ceglany. Jego ciepło buduje atmosferę swobody i zachęca młodych użytkowników do spędzania tu czasu. Centralna część tej strefy została podzielona regałami, tworząc bardziej kameralne wnętrza: z długim stołem do pracy, spotkań i gier oraz miękkimi meblami, które sprzyjają czytaniu i odpoczynkowi. Wzdłuż okien zaplanowano blaty do pracy z indywidualnym oświetleniem, wyposażone w możliwość podłączenia tabletu lub laptopa. Pojawiają się tu także miękkie sofki i wygodne fotele ze stolikami, tworzące komfortowe mikroprzestrzenie. Ciekawym elementem jest zastosowanie lustrzanej okładziny ponad regałami, która optycznie powiększa wnętrze oraz nadaje mu lekkości. W lewym skrzydle mieści się biblioteka dla dzieci, zaprojektowana w przewodnim niebieskim kolorze, sprzyjającym skupieniu, wyciszeniu i poczuciu bezpieczeństwa. Wysokie regały dzielą przestrzeń na mniejsze, przyjazne dla najmłodszych obszary, a w ich strukturze umieszczono okna do siedzenia, które kadrują widoki i tworzą atrakcyjne miejsca do lektury. Całość uzupełniają tapicerowane siedziska o obłych, miękkich kształtach, bezpieczne i zachęcające do zabawy oraz odpoczynku. Naprzeciwko biblioteki znajduje się strefa relaksu dla dzieci, w kolorze ceglanym. Umieszczono tu niski regał z książkami i miękkie elementy sprzyjające zabawie i eksploracji. W ramach tej części piętra wydzielono również pomieszczenie terapeutyczne, przeznaczone dla osób w różnym wieku, w tym w spektrum autyzmu. Zaprojektowane zostało w kojącym zielonym kolorze, aby wspierać poczucie bezpieczeństwa i komfort sensoryczny. Dalszą część lewego skrzydła zajmuje kompleks pomieszczeń socjalnych, biurowych i magazynowych, stanowiących zaplecze dla pracowników biblioteki.',
    ],
    description: 'Konkursowy projekt koncepcyjny wnętrz wojewódzkiej i miejskiej biblioteki publicznej w Gdańsku. Trzy barwy przewodnie — ceglany, zielony i niebieski — porządkują przestrzenie parteru i piętra, tworząc miejsce otwarte, elastyczne i dostępne dla wszystkich.',
    relatedService: 'oferta',
    caseStudy: {
      problem: 'Konkursowa koncepcja zakładała stworzenie przestrzeni inkluzywnych, otwartych i nieonieśmielających — dostępnych dla wszystkich użytkowników bez względu na wiek, potrzeby czy sposób korzystania z biblioteki — oraz elastycznych funkcjonalnie i przyszłościowo.',
      decisions: [
        'Koncept oparto na świadomym wykorzystaniu teorii barw i trzech barwach przewodnich: ceglanej, zielonej i niebieskiej, które różnicują nastrój i porządkują strefy.',
        'Okrągła lada recepcyjna o inkluzywnej, dostępnej z każdej strony formie organizuje ruch na parterze.',
        'Mobilne meble pozwalają szybko przearanżować przestrzeń — nawet pod większe wydarzenia kulturalne.',
        'Pomieszczenie terapeutyczne dla osób w różnym wieku, w tym w spektrum autyzmu, zaprojektowano w kojącym zielonym kolorze.',
      ],
      result: 'Zaprojektowane wnętrze nie tylko spełnia wymagania funkcjonalne, ale przede wszystkim buduje doświadczenie — spokojne, bezpieczne, inspirujące i dostępne dla wszystkich.',
    },
    en: {
      title: 'library',
      meta: { title: 'Joseph Conrad Korzeniowski Voivodeship and Municipal Public Library - Competition to develop an interior architecture conceptual design' },
      scope: ['venue concept', 'interior design', 'furniture design', 'lamp design'],
      description: 'Competition-stage interior conceptual design for the voivodeship and municipal public library in Gdańsk. Three signature colours — brick red, green and blue — organise the ground- and first-floor spaces, creating a place that is open, flexible and accessible to all.',
      caseStudy: {
        problem: 'The competition concept set out to create inclusive, open and unintimidating spaces — accessible to all users regardless of age, needs or how they use the library — and flexible both functionally and for the future.',
        decisions: [
          'The concept was built on a deliberate use of colour theory and three signature colours — brick red, green and blue — that differentiate mood and order the zones.',
          'A round reception desk, inclusive and approachable from every side, organises circulation on the ground floor.',
          'Mobile furniture allows the space to be rearranged quickly — even for larger cultural events.',
          'A therapy room for people of various ages, including those on the autism spectrum, is designed in a soothing green.',
        ],
        result: 'The designed interior not only meets functional requirements but, above all, builds an experience — calm, safe, inspiring and accessible to everyone.',
      },
      descriptionBlocks: [
        'Our overriding goal in designing the interiors of the first floor and ground floor of the building at Targ Rakowy 5/6 in Gdańsk was to create inclusive, open and unintimidating spaces — places accessible to all users, regardless of age, needs or how they use the library. Flexibility was key for us: functional flexibility, allowing the library to carry out its current tasks, and future-proofing, allowing it to adapt smoothly to new activities, ways of working and forms of participation. To achieve this, we built the concept on a deliberate use of colour theory and its effects — it is colour that became the foundation of the visual and emotional coherence of the entire project. In interior design, colour does not play a merely aesthetic role — it is one of the key means of influencing users\' perception, wellbeing and behaviour. Colour theory describes the relationships between colours, their influence on how a space is perceived and the psychophysical reactions they provoke. A well-chosen palette can aid concentration, calm or stimulate, bring order to a space or guide movement through it. In a library — a place that brings together diverse activities, from work and study through recreation to meetings and events — colour becomes an ally in building mood, functional zoning and an intuitive interior. On this basis we chose three signature colours with strong yet complementary properties: brick red, green and blue. Each carries different meanings, supports a different type of activity and helps shape the character of the place. Set alongside one another, these colours allow the spaces to differ in mood while retaining a cohesive, harmonious identity.',
        'Brick red: Brick red brings warmth, cosiness and a sense of closeness to the interior. It encourages relaxation and an intimate atmosphere, invites calm interaction and gives an impression of naturalness. It evokes authenticity, the earth and traditional values, creating friendly surroundings. Blue: Blue lends the space freshness, harmony and a feeling of breathing room. It soothes the emotions, aids concentration and supports logical thinking, creating ideal conditions for mental work. It inspires trust and a sense of stability, bringing a modern, professional character. Green: Green has a calming, harmonising effect, letting the eye rest and creating an atmosphere of tranquillity. It fosters focus and gently orders the space without imposing itself on the user. As a colour tied to nature, it brings freshness, authenticity and a sense of balance to the interior. Together, the chosen palette — brick red, green and blue — forms a multidimensional visual language that supports the idea of the library as an open, friendly and flexible space. Each colour performs a specific role, answering the needs of different user groups and types of activity. This deliberate work with colour produces an interior that not only meets functional requirements but, above all, builds an experience — calm, safe, inspiring and accessible to everyone.',
        'The ground floor serves as the library\'s representative and most accessible part, so we planned it as a space that is open, legible and welcoming from the very first step. In the entrance zone we used brick red as the signature colour; its warmth and naturalness create an atmosphere of hospitality and break down the formality typical of public institutions. The colour reinforces a sense of closeness and makes for a comfortable threshold for users. At the centre, directly opposite the door, a round reception desk organises circulation and forms the first point of contact. Its form is inclusive and approachable from every side, and its soft, rounded shapes follow the principle of an unintimidating space. Directly behind the desk sits a planter with lush greenery, introducing an element of nature and creating a visual accent that softens the entrance area. Benches are arranged around this central section, offering a moment\'s rest; the deeper one moves into the ground floor, the softer the seating becomes, inviting a longer stay. To the right of the reception is a quiet work room, where we applied blue as the signature colour — conducive to concentration, focus and creativity. Thanks to furnishings that adapt easily to different needs, this space can also serve as a small conference or meeting room. To the left of the entrance lies the reading-room zone, kept in a green palette. It is a calm, natural and flexible space. Here we used sheer curtains that subtly section off smaller, more intimate areas without losing lightness or the flow of daylight. The reading room is furnished with small sofas and workspaces at a long counter beneath the windows. All the remaining furniture is mobile, so the space can be rearranged quickly and easily — even for larger cultural events. The zone culminates in a tall bookcase that acts as a backdrop for talks, conversations and gatherings while visually ordering the space.',
        'The library\'s first floor is divided into two clear functional zones, corresponding to different user groups and their needs. The design envisions flexible, friendly spaces that support both work and rest, as well as appropriate back-of-house facilities for staff. The right wing houses the youth media library, where the main signature colour is brick red. Its warmth builds a relaxed atmosphere and encourages young users to spend time here. The central part of this zone is divided by bookcases, creating more intimate interiors: a long table for working, meeting and playing games, and soft furniture that invites reading and rest. Along the windows there are work counters with individual lighting, with provision for plugging in a tablet or laptop. Soft small sofas and comfortable armchairs with side tables also appear here, forming cosy micro-spaces. A distinctive touch is the mirrored cladding above the bookcases, which visually enlarges the interior and lends it lightness. The left wing holds the children\'s library, designed in a signature blue that fosters focus, calm and a sense of security. Tall bookcases divide the space into smaller areas friendly to the youngest visitors, and seating windows set into their structure frame views and create inviting places to read. Upholstered seats with soft, rounded shapes complete the whole — safe and inviting for play and rest. Opposite the children\'s library is a relaxation zone for children, in brick red. It holds a low bookcase and soft elements that encourage play and exploration. This part of the floor also includes a dedicated therapy room, intended for people of various ages, including those on the autism spectrum. It is designed in a soothing green to support a sense of safety and sensory comfort. The remainder of the left wing is occupied by a suite of staff, office and storage rooms that form the library\'s back-of-house.',
      ],
    },
  },
  {
    id: '9',
    slug: 'lazienki-warszawa',
    title: 'łazienki',
    location: 'Warszawa',
    category: 'mieszkalne',
    status: 'completed',
    year: 2026,
    area: '8 m²',
    scope: ['projekt koncepcyjny wnętrz', 'projekty mebli', 'projekt wykonawczy wnętrz', 'nadzór autorski'],
    thumbnail: '/images/lazienki-warszawa/kool_l_warszawa_MAIN.webp',
    featured: false,
    images: [
      '/images/lazienki-warszawa/kool_l_warszawa_01.webp', // 01 hero – onyksowy blat, dębowa zabudowa
      '/images/lazienki-warszawa/kool_l_warszawa_02.webp', // 02 square – łazienka 1 (text left)
      '/images/lazienki-warszawa/kool_l_warszawa_03.webp', // 03 square – prysznic i umywalka, row left
      '/images/lazienki-warszawa/kool_l_warszawa_04.webp', // 04 portrait – prysznic i wc, row right (padded)
      '/images/lazienki-warszawa/kool_l_warszawa_06.webp', // 06 portrait 2:3 – łazienka 2, row right (flush)
      '/images/lazienki-warszawa/kool_l_warszawa_07.webp', // 07 square – umywalka łazienki 2, row left
      '/images/lazienki-warszawa/kool_l_warszawa_08.webp', // 08 portrait – prysznic łazienki 2, row right (padded)
    ],
    // The Instagram axonometry reel replaces the static 05 aksonometria
    // (same pattern as mieszkanie-gdansk); index counts the hero (0)
    reel: { src: '/videos/lazienki-warszawa-reel.mp4', index: 4 },
    textRows: [{ row: 0, side: 'left' }],
    flipRowParity: true,
    portraitIndices: [5],
    descriptionBlocks: [
      'Łazienki w stylu współczesnym z silnymi wpływami retro i artystycznym podejściem do materiałów. Pierwsze wrażenie we wnętrzu buduje ciepła nasycona kolorystyka. Ceglana mozaika oplata zaobloną wnękę prysznicową jak ceramiczna tkanina, wprowadzając do wnętrza miękkość i głębię. Rezygnacja z wanny pozwoliła odzyskać przestrzeń i stworzyć układ bardziej płynny, podporządkowany rytmowi codziennych rytuałów. Centralnym punktem większej łazienki jest umywalkowa zabudowa w ziemistozielonym odcieniu zestawiona z żółtym onyksowym blatem. Kamień przyciąga uwagę wyraźnym użyleniem i połyskiem, który zmienia się wraz z kątem padania światła. Nad nim kremowe płytki strukturalne subtelnie rozpraszają światło, kontrastując z chłodnym połyskiem chromowanego lustra i granatowych detali armatury. Projekt operuje na wyraźnym zestawieniu surowości i elegancji w dopracowanych detalach. Ich relacja nie jest konfrontacją, lecz spokojnym dialogiem materiałów. Czarno-białe terrazzo wnosi graficzną energię inspirowaną estetyką retro, podczas gdy dębowa zabudowa porządkuje kompozycję i równoważy intensywność użytych materiałów. Druga łazienka rozwija tę samą narrację w jaśniejszej tonacji. Piaskowe płytki, jasne lastryko i wielkoformatowe lustro sprawiają, że niewielka przestrzeń nabiera butikowego, hotelowego klimatu. Nawet ceglana zabudowa skrywająca pralnię staje się częścią kompozycji, a nie tłem.',
    ],
    description: 'Dwie łazienki w stylu współczesnym z silnymi wpływami retro. Ceglana mozaika, żółty onyksowy blat i czarno-białe terrazzo prowadzą spokojny dialog materiałów, a dębowa zabudowa porządkuje kompozycję.',
    en: {
      title: 'bathrooms',
      location: 'Warsaw',
      scope: ['interior conceptual design', 'furniture design', 'interior construction design', 'author\'s supervision'],
      description: 'Two contemporary bathrooms with strong retro influences. Brick-red mosaic, a yellow onyx countertop and black-and-white terrazzo hold a calm dialogue of materials, while built-in oak joinery brings order to the composition.',
      descriptionBlocks: [
        'Bathrooms in a contemporary style with strong retro influences and an artistic approach to materials. The first impression inside is built by a warm, saturated colour palette. Brick-red mosaic wraps the rounded shower niche like a ceramic fabric, bringing softness and depth to the interior. Forgoing the bathtub freed up space and allowed for a more fluid layout, attuned to the rhythm of daily rituals. The focal point of the larger bathroom is a built-in washbasin unit in an earthy green shade, paired with a yellow onyx countertop. The stone draws the eye with its pronounced veining and a sheen that shifts with the angle of the light. Above it, cream textured tiles softly diffuse the light, contrasting with the cool gleam of the chrome mirror and the navy-blue details of the fittings. The design plays on a clear juxtaposition of rawness and elegance, refined in its details. Their relationship is not a confrontation but a calm dialogue of materials. Black-and-white terrazzo brings a graphic energy inspired by retro aesthetics, while built-in oak joinery brings order to the composition and balances the intensity of the materials. The second bathroom carries the same narrative into a lighter key. Sand-coloured tiles, pale terrazzo and a large-format mirror give the small space the feel of a boutique hotel. Even the brick-red built-in unit concealing the laundry area becomes part of the composition rather than a backdrop.',
      ],
    },
  },
  {
    id: '10',
    slug: 'mieszkanie-gdansk',
    title: 'mieszkanie',
    location: 'Gdańsk',
    category: 'mieszkalne',
    status: 'completed',
    year: 2026,
    area: '46 m²',
    scope: ['projekt koncepcyjny wnętrz', 'projekty mebli', 'projekt wykonawczy wnętrz', 'nadzór autorski'],
    thumbnail: '/images/mieszkanie-gdansk/kool_m_gdansk_MAIN.webp',
    featured: false,
    // Display order (board): hero, [02 + text], [03 full], [slider + reel],
    // [06 full], [07 + 08]. The 05a/05b bedroom pair is the noc/dzień slider;
    // the shelf illustration (04) is dropped — the reel already animates it.
    images: [
      '/images/mieszkanie-gdansk/kool_m_gdansk_01.webp',  // 01 hero – kuchnia i strefa dzienna
      '/images/mieszkanie-gdansk/kool_m_gdansk_02.webp',  // 02 square – przedpokój z lustrem (text right)
      '/images/mieszkanie-gdansk/kool_m_gdansk_03.webp',  // 03 full-width – strefa dzienna za dnia
      '/images/mieszkanie-gdansk/kool_m_gdansk_06.webp',  // 06 full-width – kuchnia i regał z zabudową
      '/images/mieszkanie-gdansk/kool_m_gdansk_07.webp',  // 07 square – strefa dzienna wieczorem, row left
      '/images/mieszkanie-gdansk/kool_m_gdansk_08.webp',  // 08 portrait – regał wieczorem, row right (padded)
    ],
    // Indices count the hero (0) and each inserted slot (slider 3, reel 4)
    fullWidthIndices: [2, 5],
    slider: {
      beforeSrc: '/images/mieszkanie-gdansk/kool_m_gdansk_05a.webp', // noc
      afterSrc: '/images/mieszkanie-gdansk/kool_m_gdansk_05b.webp',  // dzień
      labels: ['noc', 'dzień'],
      index: 3,
    },
    reel: { src: '/videos/mieszkanie-gdansk-reel.mp4', index: 4 },
    textRows: [{ row: 0, side: 'right' }],
    descriptionBlocks: [
      'W tym mieszkaniu w Gdańsku beton nie chłodzi, przeciwnie, oddycha ciepłem i światłem, stając się tłem dla życia w powolnym tempie. Już od progu uwagę przyciąga miękka szarość przecieranych powierzchni, których nieregularna faktura łapie światło. To przestrzeń zbudowana na kontrastach, ale pozbawiona ostentacji. Surowość spotyka tu miękkość, industrialny charakter miesza się z atmosferą azylu. Projekt opiera się na dwóch wyraźnych światach kolorystycznych, które prowadzą między sobą subtelny dialog. Strefa dzienna tonie w odcieniach kości słoniowej, piaskowych tynków i lnianych beży, przełamanych złocistymi rudościami obszernej sofy obitej mięsistą, strukturalną tkaniną. To właśnie tutaj światło dzienne pracuje najmocniej. Rozlewa się po betonowej podłodze, podkreśla ziarnistość ścian i wydobywa ciepło drewna. Wieczorem charakter wnętrza zmienia się całkowicie. Boczne, pomarańczowe światło miękko osiada na powierzchniach, rozmywa granice i zamienia papierowy klosz w żarzący się punkt przypominający zachodzące słońce. Kuchnia i biblioteka tworzą bardziej wyrazisty kadr. Chłodniejsze odcienie betonu zestawiono tu z głęboką zielenią terakoty oraz lustrzanymi frontami górnych szafek, które odbijają światło i multiplikują przestrzeń. Centralnym elementem pozostaje wyspa w formie masywnej, wielofunkcyjnej bryły, wokół której koncentruje się codzienność: gotowanie, rozmowy, praca i spontaniczne spotkania. Regały wypełnione książkami i kolekcjonowanymi obiektami nadają wnętrzu osobistego charakteru. Sypialnia została pomyślana jako miejsce odpoczynku, pracy i twórczości. Łóżko osadzone na dedykowanej skrzyni jest sporym miejscem do przechowywania, a obecność instrumentów muzycznych podkreśla zainteresowania właściciela. W całym mieszkaniu czuć inspiracje estetyką lat 70. i japońsko-skandynawskim podejściem do materiału: szczerym, sensualnym, skupionym na świetle i strukturze. To ciepły brutalizm w intymnym wydaniu: miejska odskocznia, która nie imponuje rozmachem, lecz atmosferą pozostającą z użytkownikiem długo po zmroku.',
    ],
    description: 'Mieszkanie w Gdańsku, w którym beton oddycha ciepłem i światłem. Ciepły brutalizm w intymnym wydaniu — piaskowe tynki i lniane beże strefy dziennej prowadzą dialog z zielenią terakoty w kuchni, a wieczorem wnętrze zmienia charakter.',
    en: {
      title: 'apartment',
      scope: ['interior conceptual design', 'furniture design', 'interior construction design', 'author\'s supervision'],
      description: 'An apartment in Gdańsk where concrete breathes with warmth and light. Warm brutalism in an intimate register — the sandy plasters and linen beiges of the living area converse with the green of terracotta tiles in the kitchen, and by evening the interior changes character.',
      descriptionBlocks: [
        'In this Gdańsk apartment concrete does not chill — on the contrary, it breathes with warmth and light, becoming a backdrop for life lived at a slow pace. From the threshold, the eye is drawn to the soft grey of rubbed plaster surfaces, their irregular texture catching the light. This is a space built on contrasts, yet free of ostentation. Rawness meets softness here, and an industrial character mingles with the atmosphere of a refuge. The design rests on two distinct colour worlds engaged in a subtle dialogue. The living area is steeped in shades of ivory, sandy plaster and linen beige, offset by the golden russet of a generous sofa upholstered in a thick, textured fabric. It is here that daylight works hardest. It spills across the concrete floor, accentuates the graininess of the walls and draws out the warmth of the wood. By evening the character of the interior changes entirely. Orange side lighting settles softly on the surfaces, blurring boundaries and turning the paper lampshade into a glowing point reminiscent of a setting sun. The kitchen and library form a bolder frame. Cooler tones of concrete are set here against the deep green of terracotta tiles and the mirrored fronts of the upper cabinets, which reflect the light and multiply the space. The centrepiece remains the island — a massive, multifunctional block around which daily life gathers: cooking, conversation, work and spontaneous get-togethers. Shelving filled with books and collected objects lends the interior a personal character. The bedroom is conceived as a place for rest, work and creativity. The bed, set on a bespoke storage chest, offers generous storage space, while the presence of musical instruments speaks to the owner\'s interests. Throughout the apartment one senses inspirations from 1970s aesthetics and a Japanese-Scandinavian approach to material: honest, sensual, focused on light and texture. This is warm brutalism in an intimate register: an urban retreat that impresses not with scale but with an atmosphere that stays with its inhabitant long after dark.',
      ],
    },
  },
  {
    id: '11',
    slug: 'mieszkanie-strachowicka',
    title: 'mieszkanie',
    location: 'Wrocław',
    category: 'mieszkalne',
    status: 'completed',
    year: 2026,
    area: '72 m²',
    scope: ['projekt koncepcyjny wnętrz', 'projekty mebli', 'projekt wykonawczy wnętrz', 'nadzór autorski'],
    thumbnail: '/images/mieszkanie-strachowicka/kool_m_strachowicka_04.webp',
    featured: false,
    // Display order (board): hero, [02 + text], [03 full], [04 + reel],
    // [text + 06], [07 + 08], [rzut przed/po slider], [10 full], [11 + 12],
    // [13 full]. The reel animates the axonometry illustration from the
    // designer's layout.
    images: [
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_01.webp',         // 01 hero – strefa dzienna z kuchnią
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_02.webp',         // 02 square – przedpokój z ceglaną zabudową (text right)
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_03.webp',         // 03 full-width – jadalnia i salon z sofą
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_04.webp',         // 04 square – wyspa kuchenna z błękitnymi lampami (reel right)
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_06.webp',         // 06 square – salon z zabudową TV (text left)
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_07.webp',         // 07 square – łazienka z różowym prysznicem, row left
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_08.webp',         // 08 portrait – detal blatu z lastryko, row right (padded)
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_rzut_przed.webp', // rzut – stan przed (slider pair)
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_rzut_po.webp',    // rzut – stan po (slider pair)
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_10.webp',         // 10 full-width – łazienka z błękitną zabudową
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_11.webp',         // 11 portrait – miejsce do pracy, row left (padded)
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_12.webp',         // 12 square – sypialnia z błękitną tapetą, row right
      '/images/mieszkanie-strachowicka/kool_m_strachowicka_13.webp',         // 13 full-width – sypialnia
    ],
    // Indices count the hero (0) and the reel slot (4)
    fullWidthIndices: [2, 10, 13],
    reel: { src: '/videos/mieszkanie-strachowicka-reel.mp4', index: 4 },
    containedPairs: [{ indices: [8, 9], labels: ['przed', 'po'], scale: 0.75, aspect: 'aspect-[2560/1006]' }],
    textRows: [
      { row: 0, side: 'right' },
      { row: 3, side: 'left' },
    ],
    descriptionBlocks: [
      'Mieszkanie zaprojektowane z myślą o rodzinie, dla której dom miał stać się przestrzenią wspierającą codzienne funkcjonowanie. Jednym z kluczowych założeń projektu było uwzględnienie potrzeb związanych z ADHD – stworzenie wnętrza terapeutycznego, które będzie działało kojąco na układ nerwowy i dawało poczucie harmonii. Czytelny układ funkcjonalny, ograniczenie otwartych półek, proste zabudowy nadały wizualnego porządku przestrzeni. Obłości w meblach oraz miękkości naturalnych tkanin koją zmysły. Przyszłym mieszkańcom zależało na kolorach, ale spokojnych tonacjach, stąd paleta ciepłych beży, błękitów oraz róży uzupełniona o elementy z naturalnego drewna.\nSercem mieszkania jest otwarta strefa dzienna, zaprojektowana jako miejsce wspólnego spędzania czasu. Kuchnia z wyspą organizuje codzienne życie domowników – to tutaj toczą się rozmowy podczas gotowania i spotkania przy porannej kawie. Ciepły dębowy fornir zestawiono z czekoladową wyspą z barwionego MDF-u, stalowym okapem i wyrazistym akcentem w postaci błękitnych lamp, które subtelnie ożywiają stonowaną kompozycję.\nPłynnie połączony z kuchnią salon oferuje różne scenariusze użytkowania. Modułowa sofa pozwala łatwo dostosować przestrzeń do rodzinnych seansów filmowych lub spokojnego wieczoru z książką. Błękitna zabudowa dyskretnie ukrywa telewizor, dzięki czemu wnętrze pozostaje spokojne wizualnie, a lustrzane fronty dodatkowo wzmacniają wrażenie przestronności. W drugiej części salonu znalazła się jadalnia z rozkładanym stołem, któremu towarzyszą lekkie, gięte krzesła polskiej produkcji.',
      'Prywatna część mieszkania utrzymana jest w równie spokojnym tonie. W sypialni główną rolę odgrywa wielkoformatowa tapeta w odcieniach błękitu nadając wnętrzu wyrazisty charakter. Tuż obok, oddzielone stalową witryną z ornamentowym szkłem, znajduje się kompaktowe miejsce do pracy. Transparentna przegroda pozwala zachować dostęp światła i wizualną lekkość, jednocześnie subtelnie wyznaczając granicę między strefą odpoczynku a pracy.\nŁazienka dopełnia opowieść o mieszkaniu. Pudrowy róż wielkoformatowych płytek spotyka się z błękitną zabudową, tworząc spokojną, lecz niebanalną kompozycję. Mikrocement w beżowym kolorze zwiększa komfort użytkowania, a blaty z lastryko, robione na specjalne zamówienie oraz duże lustra dodają wnętrzu elegancji i optycznej lekkości.\nCałość to przykład projektu, w którym estetyka wynika z uważnego projektowania codzienności. Zamiast nadmiaru form i dekoracji pojawia się świadomie zaplanowany porządek, sprzyjający koncentracji, odpoczynkowi i wspólnemu życiu. To wnętrze, które nie tylko dobrze wygląda, ale przede wszystkim odpowiada na realne potrzeby swoich mieszkańców.',
    ],
    description: 'Mieszkanie we Wrocławiu zaprojektowane z myślą o rodzinie i potrzebach związanych z ADHD — wnętrze terapeutyczne, które koi układ nerwowy i daje poczucie harmonii. Paleta ciepłych beży, błękitów oraz różu uzupełniona o naturalne drewno.',
    caseStudy: {
      problem: 'Mieszkanie zaprojektowano dla rodziny, a jednym z kluczowych założeń było uwzględnienie potrzeb związanych z ADHD – stworzenie wnętrza terapeutycznego, które będzie działało kojąco na układ nerwowy i dawało poczucie harmonii.',
      decisions: [
        'Czytelny układ funkcjonalny, ograniczenie otwartych półek i proste zabudowy nadały przestrzeni wizualny porządek.',
        'Obłości mebli i miękkość naturalnych tkanin koją zmysły.',
        'Spokojna paleta ciepłych beży, błękitów i różu, uzupełniona o naturalne drewno, odpowiada na życzenie mieszkańców, by kolory pozostały stonowane.',
        'Błękitna zabudowa z lustrzanymi frontami ukrywa telewizor i wzmacnia wrażenie przestronności, a stalowa witryna z ornamentowym szkłem wyznacza granicę między strefą odpoczynku a pracy, nie odcinając światła.',
      ],
      result: 'Estetyka wynika tu z uważnego projektowania codzienności — świadomie zaplanowany porządek sprzyja koncentracji, odpoczynkowi i wspólnemu życiu, odpowiadając na realne potrzeby mieszkańców.',
    },
    en: {
      title: 'apartment',
      scope: ['interior conceptual design', 'furniture design', 'interior construction design', 'author\'s supervision'],
      description: 'An apartment in Wrocław designed with a family and their ADHD-related needs in mind — a therapeutic interior that soothes the nervous system and brings a sense of harmony. A palette of warm beiges, blues and pinks, complemented by natural wood.',
      caseStudy: {
        problem: 'The apartment was designed for a family, and one of the key premises was to accommodate ADHD-related needs — to create a therapeutic interior that calms the nervous system and brings a sense of harmony.',
        decisions: [
          'A legible functional layout, a minimum of open shelving and simple built-in joinery lend the space visual order.',
          'Rounded furniture forms and the softness of natural fabrics soothe the senses.',
          'A calm palette of warm beiges, blues and pinks, complemented by natural wood, answers the residents\' wish to keep the colours muted.',
          'Blue cabinetry with mirrored fronts conceals the television and heightens the sense of space, while a steel-framed partition of patterned glass marks the boundary between rest and work without cutting off the light.',
        ],
        result: 'Here aesthetics grow out of the attentive design of everyday life — a deliberately planned order that favours concentration, rest and shared living, answering the real needs of the residents.',
      },
      descriptionBlocks: [
        'An apartment designed for a family whose home was to become a space that supports everyday life. One of the key premises of the project was to accommodate ADHD-related needs — to create a therapeutic interior that calms the nervous system and brings a sense of harmony. A legible functional layout, a minimum of open shelving and simple built-in joinery lend the space visual order, while rounded furniture forms and the softness of natural fabrics soothe the senses. The future residents wanted colour, but in calm tones — hence a palette of warm beiges, blues and pinks, complemented by elements of natural wood.\nThe heart of the apartment is the open-plan living area, designed as a place to spend time together. A kitchen with an island organises the household\'s daily life — this is where conversations unfold over cooking and where the household gathers over morning coffee. Warm oak veneer is set against a chocolate-brown island in stained MDF, a steel extractor hood and a bold accent of blue lamps that subtly enliven the muted composition.\nFlowing seamlessly from the kitchen, the living room offers a range of scenarios for use. A modular sofa makes it easy to adapt the space for family film nights or a quiet evening with a book. Blue built-in cabinetry discreetly conceals the television, keeping the interior visually calm, while mirrored fronts further heighten the sense of spaciousness. The other end of the living room holds a dining area with an extendable table, accompanied by light bentwood chairs made in Poland.',
        'The private part of the apartment keeps to an equally calm tone. In the bedroom, the leading role belongs to a large-format wallpaper in shades of blue, giving the interior a distinctive character. Right beside it, separated by a steel-framed partition of patterned glass, sits a compact workspace. The transparent screen preserves daylight and visual lightness while subtly marking the boundary between rest and work.\nThe bathroom completes the apartment\'s story. The powder pink of large-format tiles meets blue cabinetry in a calm yet far-from-ordinary composition. Beige microcement adds everyday comfort, while custom-made terrazzo countertops and generous mirrors lend the interior elegance and optical lightness.\nThe result is an example of a project in which aesthetics grow out of the attentive design of everyday life. In place of an excess of forms and decoration there is a deliberately planned order — one that favours concentration, rest and shared living. It is an interior that not only looks good, but above all answers the real needs of the people who live in it.',
      ],
    },
  },
  {
    id: '12',
    slug: 'biuro-dobry-material',
    title: 'biuro Dobry Materiał',
    location: 'Wrocław',
    category: 'komercyjne',
    status: 'completed',
    year: 2023,
    area: '79 m²',
    scope: ['projekt koncepcyjny wnętrz', 'projekty mebli', 'projekt wykonawczy wnętrz', 'nadzór autorski'],
    thumbnail: '/images/biuro-dobry-material/kool_dobry_material_main.webp',
    featured: false,
    meta: {
      title: 'biuro firmy Dobry Materiał®',
    },
    // Display order (board): hero, [02 + text], [parawany + 04], [05 full],
    // [text + 06], [rzut aranżacja 1/2 slider], [08 full], [09 + 10]
    images: [
      '/images/biuro-dobry-material/kool_dobry_material_01.webp',       // 01 hero – strefa wejściowa z zielonym parawanem
      '/images/biuro-dobry-material/kool_dobry_material_02.webp',       // 02 square – część socjalna z grafikami marki (text right)
      '/images/biuro-dobry-material/kool_dobry_material_parawany.webp', // ilustracja – mobilne parawany, row left (padded)
      '/images/biuro-dobry-material/kool_dobry_material_04.webp',       // 04 square – sofa i neon Dobry Materiał, row right
      '/images/biuro-dobry-material/kool_dobry_material_05.webp',       // 05 full-width – strefa open office z pomarańczowym parawanem
      '/images/biuro-dobry-material/kool_dobry_material_06.webp',       // 06 square – drugie biuro z plakatami (text left)
      '/images/biuro-dobry-material/kool_dobry_material_rzut_01.webp',  // rzut – aranżacja 1 (slider pair)
      '/images/biuro-dobry-material/kool_dobry_material_rzut_02.webp',  // rzut – aranżacja 2 (slider pair)
      '/images/biuro-dobry-material/kool_dobry_material_08.webp',       // 08 full-width – biuro z rowerem na ścianie
      '/images/biuro-dobry-material/kool_dobry_material_09.webp',       // 09 square – stół konferencyjny na tle muralu, row left
      '/images/biuro-dobry-material/kool_dobry_material_10.webp',       // 10 portrait – zielona sofa i wyspa, row right (padded)
    ],
    fullWidthIndices: [4, 8],
    containedPairs: [{ indices: [6, 7], labels: ['aranżacja 1', 'aranżacja 2'], scale: 0.75, aspect: 'aspect-[2560/1488]' }],
    textRows: [
      { row: 0, side: 'right' },
      { row: 3, side: 'left' },
    ],
    descriptionBlocks: [
      'Siedziba Dobrego Materiału powstała jako przestrzeń, która odzwierciedla charakter marki – dynamicznej, wyrazistej i otwartej na zmianę. Głównym założeniem było pozostawienie istniejącej bazy - koloru ścian, elektryki, drewnianego parkietu po renowacji, stolarki i uzupełnienie jej o mocne akcenty kolorystyczne i graficzne, nawiązujące do energetycznych kolorów etykiet napojów.\nStrefa wejściowa najlepiej oddaje osobowość marki – swobodny, otwarty i sprzyjający budowaniu relacji. To jednocześnie przestrzeń relaksu, w której zamiast tradycyjnej recepcji znalazła się ekspozycja Dobrego Materiału, aneks kawowy oraz miejsce do wspólnego spędzania czasu z projektorem i konsolą do gier. Miękka sofa oraz zasłona subtelnie wydzielają część socjalną, a wielkoformatowe grafiki z neonowym akcentem od pierwszych chwil wprowadzają do wnętrza energię marki.\nCharakterystycznym elementem projektu są mobilne parawany, które porządkują otwartą przestrzeń, jednocześnie ukrywając istniejące instalacje. Każdy z nich pełni dodatkową funkcję – zielony stał się ekspozytorem produktów, natomiast pomarańczowy zamieniono w tablicę do przypinania notatek, inspiracji i materiałów roboczych.',
      'Centralnym punktem biura jest strefa open office, zaprojektowana z myślą o maksymalnej elastyczności. Duże wspólne biurko można w razie potrzeby rozdzielić na dwa niezależne stanowiska, a system oświetlenia oparty na szynoprzewodach pozwala swobodnie dopasować układ opraw do zmieniającej się konfiguracji mebli. Dzięki temu przestrzeń może ewoluować wraz z potrzebami firmy.\nDrugie biuro pełni podwójną funkcję – jest zarówno miejscem codziennej pracy, jak i przestrzenią spotkań z klientami. Centralnie usytuowane biurko zostało zaprojektowane specjalnie na potrzeby tego wnętrza i detalami nawiązuje do wyposażenia strefy open office, budując spójną tożsamość całego projektu. Ważnym elementem pomieszczenia jest także duży stół konferencyjny z blatem wykończonym fornirem z ciemnej czeczoty. Ustawiony na tle muralu z logo marki staje się naturalnym centrum spotkań i prezentacji, podkreślając indywidualny charakter siedziby.\nProjekt pokazuje, że wyrazista identyfikacja wizualna może współistnieć z racjonalnym podejściem do projektowania. Zamiast całkowitej przebudowy postawiono na twórcze wykorzystanie zastanej przestrzeni, nadając jej nową energię poprzez kolor, grafikę i elastyczne rozwiązania funkcjonalne.',
    ],
    description: 'Siedziba firmy Dobry Materiał we Wrocławiu — biuro, które odzwierciedla dynamiczny charakter marki. Zastana przestrzeń zyskała nową energię dzięki mocnym akcentom kolorystycznym, wielkoformatowym grafikom i mobilnym parawanom.',
    caseStudy: {
      problem: 'Siedziba miała odzwierciedlać dynamiczny charakter marki, a głównym założeniem było pozostawienie istniejącej bazy — koloru ścian, elektryki, odnowionego parkietu i stolarki — zamiast całkowitej przebudowy.',
      decisions: [
        'Istniejącą bazę uzupełniono o mocne akcenty kolorystyczne i graficzne nawiązujące do energetycznych kolorów etykiet napojów.',
        'Zamiast tradycyjnej recepcji strefę wejściową urządzono jako otwartą przestrzeń relaksu z ekspozycją, aneksem kawowym, projektorem i konsolą.',
        'Mobilne parawany porządkują otwartą przestrzeń i ukrywają instalacje, a każdy pełni dodatkową funkcję: zielony to ekspozytor, pomarańczowy — tablica na notatki.',
        'Strefę open office zaprojektowano elastycznie: wspólne biurko można rozdzielić na dwa stanowiska, a oświetlenie na szynoprzewodach dopasować do zmian układu.',
      ],
      result: 'Zastana przestrzeń zyskała nową energię dzięki kolorowi, grafice i elastycznym rozwiązaniom — dowód, że wyrazista identyfikacja wizualna może współistnieć z racjonalnym podejściem do projektowania.',
    },
    en: {
      title: 'Dobry Materiał office',
      meta: { title: 'Dobry Materiał® company office' },
      scope: ['interior conceptual design', 'furniture design', 'interior construction design', 'author\'s supervision'],
      description: 'The Wrocław headquarters of Dobry Materiał — an office that reflects the brand\'s dynamic character. The existing space gained new energy through bold colour accents, large-format graphics and movable screens.',
      caseStudy: {
        problem: 'The headquarters was to reflect the brand\'s dynamic character, and the guiding principle was to retain the existing fabric — the wall colours, the electrics, the restored parquet and the joinery — rather than rebuild it entirely.',
        decisions: [
          'The existing fabric was layered with bold colour and graphic accents echoing the energetic colours of the drinks labels.',
          'In place of a traditional reception, the entrance was arranged as an open, relaxed zone with a product display, a coffee corner, a projector and a games console.',
          'Movable screens bring order to the open space and conceal the services, each with an added role: the green one a product display, the orange one a pinboard for notes.',
          'The open-plan zone was designed for flexibility: the shared desk can be split into two workstations and the track lighting rearranged to follow the furniture.',
        ],
        result: 'The existing space gained new energy through colour, graphics and flexible solutions — proof that a bold visual identity can coexist with a rational approach to design.',
      },
      descriptionBlocks: [
        'The Dobry Materiał headquarters was conceived as a space that reflects the character of the brand — dynamic, expressive and open to change. The guiding principle was to retain the existing fabric — the wall colours, the electrics, the restored wooden parquet, the joinery — and layer it with bold colour and graphic accents echoing the energetic colours of the drinks labels.\nThe entrance zone best captures the brand\'s personality — relaxed, open and geared towards building relationships. It is also a space for unwinding: in place of a traditional reception desk there is a display of Dobry Materiał products, a coffee corner and a spot for spending time together, complete with a projector and a games console. A soft sofa and a curtain subtly set apart the social area, while large-format graphics with a neon accent bring the brand\'s energy into the interior from the very first moments.\nThe movable screens are a signature element of the project, bringing order to the open space while concealing the existing services. Each one performs an additional role — the green one became a product display, while the orange one was turned into a pinboard for notes, inspiration and working materials.',
        'The heart of the office is the open-plan zone, designed for maximum flexibility. The large shared desk can be split into two independent workstations when needed, and a track lighting system allows the luminaires to be freely rearranged to follow the changing furniture layout. As a result, the space can evolve along with the company\'s needs.\nThe second office plays a dual role — it is both a place for everyday work and a setting for client meetings. The centrally positioned desk was designed specifically for this interior, its details referencing the furnishings of the open-plan zone and building a coherent identity across the whole project. Another key element of the room is the large conference table with a top finished in dark burl veneer. Set against a mural with the brand\'s logo, it becomes the natural focal point of meetings and presentations, underlining the individual character of the headquarters.',
      ],
    },
  },
  {
    id: '13',
    slug: 'toalety-w-teatrze',
    title: 'toalety w teatrze',
    location: 'Warszawa',
    category: 'komercyjne',
    status: 'completed',
    year: 2022,
    area: '58 m²',
    scope: ['projekt koncepcyjny wnętrz'],
    thumbnail: '/images/toalety-w-teatrze/kool_toalety_teatr_MAIN.webp',
    featured: false,
    meta: {
      title: 'toalety Teatru Wielkiego Opery Narodowej w Warszawie - konkurs na opracowanie projektu koncepcyjnego architektury wnętrz',
    },
    // Display order (board): hero, [02 + text], [03 full], [04 padded + 05],
    // [06 full], [08 + 09 padded]. Delivered 07 is a byte-identical duplicate
    // of 06 and is omitted.
    images: [
      '/images/toalety-w-teatrze/kool_toalety_teatr_01.webp', // 01 hero – marmurowa umywalka na tle zielonego lastryko
      '/images/toalety-w-teatrze/kool_toalety_teatr_02.webp', // 02 square – korytarz z rdzawym portalem (text right)
      '/images/toalety-w-teatrze/kool_toalety_teatr_03.webp', // 03 full-width – zielona kurtyna i lustro
      '/images/toalety-w-teatrze/kool_toalety_teatr_04.webp', // 04 portrait – lampy nad umywalką, row left (padded)
      '/images/toalety-w-teatrze/kool_toalety_teatr_05.webp', // 05 square – kurtyna przy przejściu, row right (flush)
      '/images/toalety-w-teatrze/kool_toalety_teatr_06.webp', // 06 full-width – umywalki i kabiny z boku
      '/images/toalety-w-teatrze/kool_toalety_teatr_08.webp', // 08 square – drzwi kabin z miedzianymi pochwytami, row left (flush)
      '/images/toalety-w-teatrze/kool_toalety_teatr_09.webp', // 09 portrait – ciemna kabina z umywalką, row right (padded)
    ],
    fullWidthIndices: [2, 5],
    flipRowParity: true,
    reverseLastRow: true,
    textRows: [{ row: 0, side: 'right' }],
    descriptionBlocks: [
      'Projekt toalet redefiniuje przestrzeń o czysto użytkowej funkcji, czyniąc z niej integralny element doświadczenia architektonicznego teatru. To miejsce, które nie stanowi jedynie zaplecza budynku, lecz naturalną kontynuację jego narracji – przestrzeń budującą nastrój jeszcze przed wejściem na widownię i pozostającą w pamięci długo po zakończeniu spektaklu.\nInspiracją dla koncepcji stał się język teatralnej scenografii. Wnętrza rozwijają się sekwencyjnie, odsłaniając kolejne plany i perspektywy, w których światło, kolor i proporcje prowadzą użytkownika przez starannie skomponowaną opowieść. Poszczególne strefy zyskują własną tożsamość, a jednocześnie pozostają częścią spójnej kompozycji opartej na rytmie kontrastów i przenikających się przestrzeni.\nPaleta barw została zbudowana wokół ciepłych, naturalnych tonów przełamanych głęboką zielenią oraz ciemnymi akcentami. Miedziane detale subtelnie wprowadzają elegancję i szlachetność, natomiast miękkie tekstylia stanowią nawiązanie do teatralnej kurtyny – symbolicznej granicy pomiędzy rzeczywistością a światem przedstawienia.\nPowściągliwe oświetlenie dopełnia kompozycję, wydobywając głębię przestrzeni i podkreślając jej sceniczny charakter. Dzięki temu toalety stają się czymś więcej niż funkcjonalnym elementem programu budynku – są kolejnym aktem teatralnego doświadczenia, w którym architektura odgrywa rolę cichego scenografa.',
    ],
    description: 'Konkursowy projekt koncepcyjny toalet Teatru Wielkiego Opery Narodowej w Warszawie. Język teatralnej scenografii — głęboka zieleń, miedziane detale i miękkie tekstylia — czyni z przestrzeni użytkowej kolejny akt teatralnego doświadczenia.',
    relatedService: 'oferta',
    caseStudy: {
      problem: 'Konkursowa koncepcja redefiniuje przestrzeń o czysto użytkowej funkcji, czyniąc z toalet integralny element doświadczenia architektonicznego teatru.',
      decisions: [
        'Inspiracją stał się język teatralnej scenografii — wnętrza rozwijają się sekwencyjnie, odsłaniając kolejne plany i perspektywy.',
        'Paleta ciepłych, naturalnych tonów została przełamana głęboką zielenią i ciemnymi akcentami.',
        'Miedziane detale wprowadzają elegancję, a miękkie tekstylia nawiązują do teatralnej kurtyny.',
        'Powściągliwe oświetlenie wydobywa głębię i sceniczny charakter przestrzeni.',
      ],
      result: 'W koncepcji toalety stają się czymś więcej niż funkcjonalnym elementem programu budynku — kolejnym aktem teatralnego doświadczenia, w którym architektura gra rolę cichego scenografa.',
    },
    en: {
      title: 'theatre toilets',
      location: 'Warsaw',
      meta: { title: 'toilets of the Teatr Wielki – Polish National Opera in Warsaw - competition to develop an interior architecture conceptual design' },
      scope: ['interior conceptual design'],
      description: 'Competition-stage conceptual design for the toilets of the Teatr Wielki – Polish National Opera in Warsaw. The language of stage scenography — deep green, copper details and soft textiles — turns a utilitarian space into another act of the theatrical experience.',
      caseStudy: {
        problem: 'The competition concept redefines a space of purely utilitarian function, making the toilets an integral part of the theatre\'s architectural experience.',
        decisions: [
          'The language of stage scenography became the inspiration — the interiors unfold sequentially, revealing successive planes and perspectives.',
          'A palette of warm, natural tones is offset by deep green and dark accents.',
          'Copper details bring elegance, while soft textiles allude to the theatre curtain.',
          'Restrained lighting draws out the depth and scenic character of the space.',
        ],
        result: 'In the concept, the toilets become more than a functional element of the building\'s programme — another act of the theatrical experience, in which architecture plays the role of a quiet scenographer.',
      },
      descriptionBlocks: [
        'The design of the toilets redefines a space of purely utilitarian function, making it an integral part of the theatre\'s architectural experience. This is a place that is not merely the building\'s back-of-house, but a natural continuation of its narrative – a space that sets the mood even before one enters the auditorium and lingers in the memory long after the performance has ended.\nThe concept draws on the language of stage scenography. The interiors unfold sequentially, revealing successive planes and perspectives in which light, colour and proportion guide the user through a carefully composed story. Individual zones gain identities of their own while remaining part of a coherent composition built on a rhythm of contrasts and interpenetrating spaces.\nThe colour palette is built around warm, natural tones offset by deep green and dark accents. Copper details bring a subtle note of elegance and refinement, while soft textiles allude to the theatre curtain – the symbolic boundary between reality and the world of the performance.\nRestrained lighting completes the composition, drawing out the depth of the space and underscoring its scenic character. The toilets thus become more than a functional element of the building\'s programme – they are another act of the theatrical experience, in which architecture plays the role of a quiet scenographer.',
      ],
    },
  },
  {
    id: '14',
    slug: 'foodhall-piazza',
    title: 'foodhall Piazza',
    location: 'Wrocław',
    category: 'komercyjne',
    status: 'completed',
    year: 2026,
    area: '340 m²',
    scope: ['projekt koncepcyjny wnętrz', 'projekty mebli', 'projekt wykonawczy wnętrz', 'nadzór autorski'],
    thumbnail: '/images/foodhall-piazza/kool_piazza_main.webp',
    featured: false,
    // Display order (board): hero, [02 + text], [03 padded + slider 04a/b],
    // [slider 05a/b + 06 padded], [07 full]. The a/b pairs are two views of
    // the same zone in square sliders, one slot each.
    images: [
      '/images/foodhall-piazza/kool_piazza_01.webp', // 01 hero – bordowa boazeria z okrągłymi lustrami
      '/images/foodhall-piazza/kool_piazza_02.webp', // 02 square – tablica materiałowa (text right)
      '/images/foodhall-piazza/kool_piazza_03.webp', // 03 portrait – popiersie na słupku, row left (padded)
      '/images/foodhall-piazza/kool_piazza_06.webp', // 06 portrait – render neonu PIAZZA, row right (padded)
      '/images/foodhall-piazza/kool_piazza_07.webp', // 07 full-width – render hali z zielonymi sofami
    ],
    // Indices count the hero (0) and each inserted slot (sliders 3 and 4)
    fullWidthIndices: [6],
    slider: [
      {
        beforeSrc: '/images/foodhall-piazza/kool_piazza_04a.webp', // sala z bordową boazerią – ujęcie 1
        afterSrc: '/images/foodhall-piazza/kool_piazza_04b.webp',  // sala z bordową boazerią – ujęcie 2
        index: 3,
        aspect: 'aspect-square',
      },
      {
        beforeSrc: '/images/foodhall-piazza/kool_piazza_05a.webp', // sala z zieloną boazerią – ujęcie 1
        afterSrc: '/images/foodhall-piazza/kool_piazza_05b.webp',  // sala z zieloną boazerią – ujęcie 2
        index: 4,
        aspect: 'aspect-square',
      },
    ],
    textRows: [{ row: 0, side: 'right', align: 'start' }],
    descriptionBlocks: [
      'Punktem wyjścia projektu była rearanżacja zastanej przestrzeni i nadanie jej nowego porządku bez radykalnej ingerencji w istniejącą strukturę. Wnętrze zyskało wyrazistą identyfikację dzięki mocnym plamom bordo i zieleni, które organizują przestrzeń i budują jej charakter. Naturalne drewno ociepla surowy charakter otwartej, industrialnej hali, wprowadzając do wnętrza bardziej kameralną i przyjazną atmosferę. Projekt został pomyślany jako proces rozłożony w czasie – zrealizowany etap stanowi świadomy początek przemiany, której kolejne rozdziały będą stopniowo dopełniać nową tożsamość miejsca.\nNa razie odsłaniamy jedynie pierwszy akt tej metamorfozy. Na pełną opowieść i wszystkie detale przyjdzie czas wraz z zakończeniem kolejnych etapów realizacji.',
    ],
    description: 'Rearanżacja industrialnej hali foodhallu Piazza we Wrocławiu. Mocne plamy bordo i zieleni organizują przestrzeń, a naturalne drewno ociepla jej surowy charakter — zrealizowany etap to pierwszy akt rozłożonej w czasie metamorfozy.',
    caseStudy: {
      problem: 'Punktem wyjścia była rearanżacja zastanej, industrialnej hali i nadanie jej nowego porządku bez radykalnej ingerencji w istniejącą strukturę.',
      decisions: [
        'Mocne plamy bordo i zieleni organizują przestrzeń i budują wyrazistą identyfikację wnętrza.',
        'Naturalne drewno ociepla surowy charakter otwartej, industrialnej hali.',
        'Projekt pomyślano jako proces rozłożony w czasie, w którym zrealizowany etap jest świadomym początkiem przemiany.',
      ],
      result: 'Zrealizowany etap to pierwszy akt rozłożonej w czasie metamorfozy — pełną opowieść dopełnią kolejne etapy realizacji.',
    },
    en: {
      scope: ['interior conceptual design', 'furniture design', 'interior construction design', 'author\'s supervision'],
      description: 'A rearrangement of the industrial hall of foodhall Piazza in Wrocław. Bold blocks of burgundy and green organise the space, while natural wood warms its raw character — the completed stage is the first act of a metamorphosis unfolding over time.',
      caseStudy: {
        problem: 'The starting point was to rearrange the existing industrial hall and give it a new order without radical intervention in the existing structure.',
        decisions: [
          'Bold blocks of burgundy and green organise the space and build a distinctive identity for the interior.',
          'Natural wood warms the raw character of the open industrial hall.',
          'The project was conceived as a process unfolding over time, in which the completed stage is a deliberate beginning of a transformation.',
        ],
        result: 'The completed stage is the first act of a metamorphosis unfolding over time — the full story will come with the next stages of delivery.',
      },
      descriptionBlocks: [
        'The starting point for the project was to rearrange the space as found and give it a new order without radical intervention in the existing structure. The interior gained a distinctive identity through bold blocks of burgundy and green, which organise the space and build its character. Natural wood warms the raw feel of the open industrial hall, bringing a more intimate, welcoming atmosphere to the interior. The project was conceived as a process unfolding over time — the completed stage is a deliberate beginning of a transformation whose subsequent chapters will gradually complete the venue\'s new identity.\nFor now, we are revealing only the first act of this metamorphosis. The full story and all the details will come with the completion of the next stages.',
      ],
    },
  },
  {
    id: '15',
    slug: 'mieszkanie-walecznych',
    title: 'mieszkanie',
    location: 'Wrocław',
    category: 'mieszkalne',
    status: 'completed',
    year: 2026,
    area: '84 m²',
    scope: ['projekt koncepcyjny wnętrz', 'projekty mebli', 'projekt wykonawczy wnętrz', 'nadzór autorski'],
    thumbnail: '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_main.webp',
    featured: false,
    // Display order (board): hero, [02 + text], [03 full], [04 padded + 05],
    // [06 + 07 padded], [text + 08], [09 full], [10 padded + 11], [12 full]
    images: [
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_01.webp', // 01 hero – salon z regałem i zieloną posadzką
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_02.webp', // 02 square – kącik śniadaniowy z zielonymi drzwiami (text right)
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_03.webp', // 03 full-width – kuchnia z bordową zabudową
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_04.webp', // 04 portrait – błękitna zasłona, row left (padded)
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_05.webp', // 05 square – hol z błękitnym stołem, row right (flush)
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_06.webp', // 06 square – korytarz łazienki z zieloną posadzką, row left (flush)
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_07.webp', // 07 portrait – szachownica w holu, row right (padded)
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_08.webp', // 08 square – wanna i prysznic (text left)
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_09.webp', // 09 full-width – umywalki z dużym lustrem
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_10.webp', // 10 portrait – łóżko z motywem szachownicy, row left (padded)
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_11.webp', // 11 square – pokój z rowerem, row right (flush)
      '/images/mieszkanie-walecznych/KOOL_m_walecznych_www_12.webp', // 12 full-width – sypialnia z ciemnym drewnem
    ],
    // Indices count the hero (0); no inserted slots
    fullWidthIndices: [2, 8, 11],
    flipRowParity: true,
    textRows: [
      { row: 0, side: 'right', align: 'start' },
      { row: 4, side: 'left', align: 'start' },
    ],
    descriptionBlocks: [
      'Projekt mieszkania interpretuje charakter przedwojennej kamienicy we współczesny sposób. Nowy układ funkcjonalny został podporządkowany codziennym potrzebom mieszkańców, tworząc bardziej komfortową i intuicyjną przestrzeń do życia. Równocześnie wnętrze wzbogacono o architektoniczne detale inspirowane historycznymi kamienicami – sztukaterie czy dekoracyjne motywy – które budują atmosferę miejsca, nie będąc dosłowną rekonstrukcją. Ich zestawienie z kolekcją mebli i przedmiotów vintage gromadzonych przez właścicieli oraz współczesnymi elementami wyposażenia tworzy wnętrze, które nie rekonstruuje przeszłości, lecz interpretuje ją na nowo.\nPaleta opiera się na odważnych, nasyconych kolorach zestawionych z ciepłymi, naturalnymi materiałami. Bordo, błękit, maślane odcienie, brzoskwinia i żywa zieleń prowadzą przez kolejne pomieszczenia, nadając każdemu z nich własną atmosferę, a jednocześnie budując spójną narrację całego mieszkania. Już od wejścia uwagę przyciąga drobna szachownica – współczesna interpretacja klasycznych posadzek charakterystycznych dla kamienic.\nKuchnia i salon funkcjonują jako dwa odrębne wnętrza, połączone wspólnym językiem materiałów i detali. W kuchni uwagę przyciąga masywny blat z lastryko wykonany na zamówienie. Okap został zintegrowany z obudową wykończoną ceramicznymi płytkami, dzięki czemu staje się dekoracyjnym elementem wnętrza. Niewielki kącik śniadaniowy przy oknie tworzy miejsce codziennych, niespiesznych rytuałów.',
      'Salon ma bardziej reprezentacyjny charakter. Główną rolę odgrywa oryginalna zielona posadzka oraz wykonany na wymiar regał, który wypełnia całą ścianę, eksponując bogatą kolekcję książek i albumów. Strefę jadalni definiuje duża szklana lampa o kulistej formie, wyznaczająca centralne miejsce wspólnych spotkań.\nŁazienkę zaprojektowano jako współczesną interpretację domowej łaźni. Naturalne światło przenika do strefy prysznica przez pas luksferów, wzmacniając wrażenie przestronności i nadając wnętrzu atmosferę domowego spa. Za miękką zasłoną ukryto strefę pralni, dzięki czemu przestrzeń zachowuje spokojny i uporządkowany charakter.\nSypialnię zbudowano na kontrastach wyrazistych wzorów i nasyconych kolorów. Błękitny sufit, intensywnie zielona zabudowa oraz dekoracyjna tapeta tworzą atmosferę sprzyjającą wyciszeniu, a tapicerowane łóżko z motywem szachownicy subtelnie nawiązuje do posadzki w holu, domykając spójną narrację całego mieszkania.\nZamiast stylistycznej rekonstrukcji powstało wnętrze oparte na świadomie budowanych kontrastach – pomiędzy historią i współczesnością, kolekcjonowanymi przez lata przedmiotami a nowymi elementami wyposażenia. To właśnie ich wzajemne relacje definiują charakter tego miejsca.',
    ],
    description: 'Mieszkanie w przedwojennej kamienicy we Wrocławiu, które interpretuje jej charakter na nowo. Bordo, błękit, maślane odcienie i żywa zieleń spotykają się z kolekcją vintage właścicieli i detalami inspirowanymi historycznymi kamienicami.',
    caseStudy: {
      problem: 'Charakter przedwojennej kamienicy trzeba było zinterpretować na nowo, a nie odtworzyć — z nowym układem funkcjonalnym podporządkowanym codziennym potrzebom mieszkańców.',
      decisions: [
        'Wnętrze wzbogacono o detale inspirowane historycznymi kamienicami — sztukaterie i dekoracyjne motywy — które budują atmosferę bez dosłownej rekonstrukcji.',
        'Odważna, nasycona paleta — bordo, błękit, maślane odcienie, brzoskwinia i żywa zieleń — prowadzi przez kolejne pomieszczenia.',
        'Drobna szachownica przy wejściu to współczesna interpretacja klasycznych posadzek kamienic.',
        'Kuchnię i salon poprowadzono jako dwa odrębne wnętrza połączone wspólnym językiem materiałów i detali.',
      ],
      result: 'Zamiast stylistycznej rekonstrukcji powstało wnętrze oparte na świadomie budowanych kontrastach — między historią a współczesnością, kolekcją właścicieli a nowymi elementami — których wzajemne relacje definiują charakter miejsca.',
    },
    en: {
      title: 'apartment',
      scope: ['interior conceptual design', 'furniture design', 'interior construction design', 'author\'s supervision'],
      description: 'An apartment in a pre-war tenement house in Wrocław that interprets its character anew. Burgundy, blue, buttery tones and vivid green meet the owners\' vintage collection and details inspired by historic tenement houses.',
      caseStudy: {
        problem: 'The character of a pre-war tenement house had to be interpreted anew rather than reconstructed, with a new functional layout shaped around the residents\' everyday needs.',
        decisions: [
          'The interior was enriched with details inspired by historic tenements — stucco mouldings and decorative motifs — that build atmosphere without literal reconstruction.',
          'A bold, saturated palette — burgundy, blue, buttery tones, peach and vivid green — leads through the successive rooms.',
          'A fine chequerboard floor at the entrance is a contemporary interpretation of the classic tenement floors.',
          'The kitchen and living room were run as two distinct interiors linked by a shared language of materials and details.',
        ],
        result: 'Instead of a stylistic reconstruction, the result is an interior built on deliberately composed contrasts — between history and the present, the owners\' collection and new furnishings — whose interplay defines the character of the place.',
      },
      descriptionBlocks: [
        'The apartment\'s design interprets the character of a pre-war tenement house in a contemporary way. The new functional layout was shaped around the residents\' everyday needs, creating a more comfortable and intuitive living space. At the same time, the interior was enriched with architectural details inspired by historic tenement houses – stucco mouldings and decorative motifs – which build the atmosphere of the place without being a literal reconstruction. Set against the collection of vintage furniture and objects gathered by the owners, and against contemporary furnishings, they create an interior that does not reconstruct the past but interprets it anew.\nThe palette rests on bold, saturated colours paired with warm, natural materials. Burgundy, blue, buttery tones, peach and vivid green lead through the successive rooms, giving each its own atmosphere while building a coherent narrative for the whole apartment. Right from the entrance, a fine chequerboard floor draws the eye – a contemporary interpretation of the classic floors characteristic of tenement houses.\nThe kitchen and living room function as two distinct interiors, linked by a shared language of materials and details. In the kitchen, a massive custom-made terrazzo worktop draws the eye. The extractor hood was integrated into an enclosure finished with ceramic tiles, turning it into a decorative element of the interior. A small breakfast nook by the window creates a place for unhurried everyday rituals.',
        'The living room has a more formal character. The leading roles belong to the original green floor and a made-to-measure bookcase that fills an entire wall, displaying a rich collection of books and albums. The dining zone is defined by a large spherical glass lamp, marking the central place for coming together.\nThe bathroom was designed as a contemporary interpretation of a home bathhouse. Natural light filters into the shower zone through a band of glass blocks, heightening the sense of spaciousness and lending the interior the atmosphere of a home spa. The laundry zone is concealed behind a soft curtain, so the space keeps its calm, orderly character.\nThe bedroom is built on contrasts of expressive patterns and saturated colours. A blue ceiling, intensely green built-in joinery and decorative wallpaper create an atmosphere conducive to rest, while an upholstered bed with a chequerboard motif subtly echoes the hall floor, completing the coherent narrative of the whole apartment.\nInstead of a stylistic reconstruction, the result is an interior built on deliberately composed contrasts – between history and the present, between objects collected over the years and new furnishings. It is precisely their interplay that defines the character of this place.',
      ],
    },
  },
];

export const projectDisplayOrder = [
  'dom-dobrzykowice',
  'delikatesy-dehesa',
  'mieszkanie-walecznych',
  'lazienki-warszawa',
  'pawilon-fandom',
  'hotel-belmonte',
  'kancelaria',
  'biblioteka-gdansk',
  'winobar-lodz',
  'mieszkanie-widmo',
  'mieszkanie-strachowicka',
  'biuro-dobry-material',
  'mieszkanie-gdansk',
  'foodhall-piazza',
  'toalety-w-teatrze',
] as const;

const projectsBySlug = new Map(projectCatalog.map((project) => [project.slug, project]));

export const projects: Project[] = projectDisplayOrder.map((slug) => {
  const project = projectsBySlug.get(slug);
  if (!project) throw new Error(`Missing project for display order slug: ${slug}`);
  return project;
});
