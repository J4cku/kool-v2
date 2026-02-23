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
    thumbnail: '/images/dobrzykowice/KOOL_dd_01.webp',
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
    src: '/images/dobrzykowice/KOOL_dd_01.webp',
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
