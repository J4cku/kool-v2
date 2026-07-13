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
  meta?: { title?: string; location?: string; collaboration?: string };
  // Self-hosted reel video (public/videos/) in the gallery flow; index
  // shares the fullWidthIndices space (position in images[], counting the
  // hero, with the reel occupying its own slot)
  reel?: { src: string; index: number };
  // Half-width before/after slider occupying one gallery slot; index shares
  // the same display-slot space as reel/fullWidthIndices
  slider?: { beforeSrc: string; afterSrc: string; labels?: [string, string]; index: number };
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
    scope: ['projekt koncepcyjny wnętrz', 'projekty mebli', 'projekty oświetlenia', 'projekt wykonawczy wnętrz', 'nadzór autorski'],
    thumbnail: '/images/hotel-belmonte/kool_belmonte_main.webp',
    featured: true,
    meta: {
      title: '4-gwiazdkowy hotel Belmonte',
    },
    // Display order (board): hero, [9:16 site reel + status text]. The reel
    // is the kool.studio Instagram construction reel (first 5s trimmed off).
    images: [
      '/images/hotel-belmonte/kool_belmonte_01.webp', // 01 hero – budowa, okrągłe okno (kadr 16:9)
    ],
    // Index counts the hero (0); the reel occupies the row-0 slot
    reel: { src: '/videos/hotel-belmonte-reel.mp4', index: 1 },
    textRows: [{ row: 0, side: 'right', align: 'start' }],
    descriptionBlocks: [
      'Projekt 4-gwiazdkowego hotelu w Ustroniu Morskim jest obecnie w realizacji.\nGdy budowa dobiegnie końca, odsłonimy wszystkie detale.',
    ],
    description: 'Projekt 4-gwiazdkowego hotelu w Ustroniu Morskim, obecnie w realizacji. Gdy budowa dobiegnie końca, odsłonimy wszystkie detale.',
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
      '/images/lazienki-warszawa/kool_l_warszawa_05.webp', // 05 portrait – aksonometria, row left (padded)
      '/images/lazienki-warszawa/kool_l_warszawa_06.webp', // 06 portrait 2:3 – łazienka 2, row right (flush)
      '/images/lazienki-warszawa/kool_l_warszawa_07.webp', // 07 square – umywalka łazienki 2, row left
      '/images/lazienki-warszawa/kool_l_warszawa_08.webp', // 08 portrait – prysznic łazienki 2, row right (padded)
    ],
    textRows: [{ row: 0, side: 'left' }],
    flipRowParity: true,
    portraitIndices: [5],
    smallIndices: [4], // 05 aksonometria – small padded, not a full render
    descriptionBlocks: [
      'Łazienki w stylu współczesnym z silnymi wpływami retro i artystycznym podejściem do materiałów. Pierwsze wrażenie we wnętrzu buduje ciepła nasycona kolorystyka. Ceglana mozaika oplata zaobloną wnękę prysznicową jak ceramiczna tkanina, wprowadzając do wnętrza miękkość i głębię. Rezygnacja z wanny pozwoliła odzyskać przestrzeń i stworzyć układ bardziej płynny, podporządkowany rytmowi codziennych rytuałów. Centralnym punktem większej łazienki jest umywalkowa zabudowa w ziemistozielonym odcieniu zestawiona z żółtym onyksowym blatem. Kamień przyciąga uwagę wyraźnym użyleniem i połyskiem, który zmienia się wraz z kątem padania światła. Nad nim kremowe płytki strukturalne subtelnie rozpraszają światło, kontrastując z chłodnym połyskiem chromowanego lustra i granatowych detali armatury. Projekt operuje na wyraźnym zestawieniu surowości i elegancji w dopracowanych detalach. Ich relacja nie jest konfrontacją, lecz spokojnym dialogiem materiałów. Czarno-białe terrazzo wnosi graficzną energię inspirowaną estetyką retro, podczas gdy dębowa zabudowa porządkuje kompozycję i równoważy intensywność użytych materiałów. Druga łazienka rozwija tę samą narrację w jaśniejszej tonacji. Piaskowe płytki, jasne lastryko i wielkoformatowe lustro sprawiają, że niewielka przestrzeń nabiera butikowego, hotelowego klimatu. Nawet ceglana zabudowa skrywająca pralnię staje się częścią kompozycji, a nie tłem.',
    ],
    description: 'Dwie łazienki w stylu współczesnym z silnymi wpływami retro. Ceglana mozaika, żółty onyksowy blat i czarno-białe terrazzo prowadzą spokojny dialog materiałów, a dębowa zabudowa porządkuje kompozycję.',
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
    thumbnail: '/images/biuro-dobry-material/kool_dobry_material_02.webp',
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
