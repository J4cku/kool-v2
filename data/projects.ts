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
};

export const projects: Project[] = [
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
    thumbnail: '/images/dobrzykowice.jpg',
    featured: false,
    images: ['/images/dobrzykowice.jpg', '/images/dobrzykowice.jpg', '/images/dobrzykowice.jpg', '/images/dobrzykowice.jpg', '/images/dobrzykowice.jpg'],
    description: 'Projekt domu jednorodzinnego w podwrocławskich Dobrzykowicach. Wnętrza łączą ciepło naturalnych materiałów z precyzyjnym detalem i funkcjonalnym układem przestrzeni.',
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
  },
  {
    id: '3',
    slug: 'winobar-lodz',
    title: 'winobar',
    location: 'Łódź',
    category: 'komercyjne',
    status: 'completed',
    year: 2025,
    area: '95 m²',
    scope: ['projekt koncepcyjny', 'dokumentacja wykonawcza', 'nadzór autorski'],
    thumbnail: '/images/prs.jpg',
    featured: false,
    images: ['/images/prs.jpg', '/images/prs.jpg', '/images/prs.jpg', '/images/prs.jpg'],
    description: 'Autorskie wnętrza o wyraźnej tożsamości. Kameralny winobar w centrum Łodzi.',
  },
  {
    id: '4',
    slug: 'pawilon-fandom',
    title: 'pawilon usługowy Fandom',
    location: 'Wrocław',
    category: 'komercyjne',
    status: 'in_progress',
    year: 2026,
    area: '250 m²',
    scope: ['projekt koncepcyjny', 'dokumentacja wykonawcza'],
    thumbnail: '/images/fnd.jpg',
    featured: false,
    images: ['/images/fnd.jpg', '/images/fnd.jpg', '/images/fnd.jpg', '/images/fnd.jpg', '/images/fnd.jpg'],
    description: 'Pawilon usługowy o surowej, betonowej estetyce w centrum Wrocławia.',
  },
  {
    id: '5',
    slug: 'hotel-belmonte',
    title: 'hotel Belmonte',
    location: 'Ustronie Morskie',
    category: 'komercyjne',
    status: 'in_progress',
    year: 2026,
    area: '1200 m²',
    scope: ['projekt koncepcyjny', 'dokumentacja wykonawcza', 'nadzór autorski', 'projekt mebli'],
    thumbnail: '/images/belmonte.jpg',
    featured: true,
    images: ['/images/belmonte.jpg', '/images/belmonte.jpg', '/images/belmonte.jpg', '/images/belmonte.jpg', '/images/belmonte.jpg', '/images/belmonte.jpg', '/images/belmonte.jpg'],
    description: 'Hotel nad morzem z autorskim wystrojem wnętrz. Przestrzenie łączące nadmorski klimat z nowoczesnym designem.',
  },
  {
    id: '6',
    slug: 'kancelaria',
    title: 'kancelaria',
    location: 'Wrocław',
    category: 'komercyjne',
    status: 'completed',
    year: 2025,
    area: '80 m²',
    scope: ['projekt koncepcyjny', 'dokumentacja wykonawcza'],
    thumbnail: '/images/kancelaria.jpg',
    featured: false,
    images: ['/images/kancelaria.jpg', '/images/kancelaria.jpg', '/images/kancelaria.jpg', '/images/kancelaria.jpg'],
    description: 'Przestrzeń biurowa o spokojnej, ciepłej estetyce. Jasne wnętrza z akcentami drewna i terrazzo.',
  },
];

export const heroImages = [
  {
    src: '/images/dobrzykowice.jpg',
    alt: 'dom Dobrzykowice',
  },
  {
    src: '/images/dehesa/kool_dehesa_01.webp',
    alt: 'delikatesy Dehesa',
  },
  {
    src: '/images/prs.jpg',
    alt: 'winobar Łódź',
  },
];
