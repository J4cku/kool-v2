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
    title: 'delikatesy Dehesa',
    location: 'Wrocław',
    category: 'komercyjne',
    status: 'completed',
    year: 2026,
    area: '120 m²',
    scope: ['projekt koncepcyjny', 'dokumentacja wykonawcza', 'nadzór autorski', 'projekt mebli', 'lamp', 'projekt identyfikacji wizualnej'],
    thumbnail: '/images/dehesa.jpg',
    featured: false,
    images: ['/images/dehesa.jpg', '/images/dehesa.jpg', '/images/dehesa.jpg', '/images/dehesa.jpg', '/images/dehesa.jpg', '/images/dehesa.jpg'],
    description: 'Autorskie wnętrza, które zostają na dłużej. Tworzymy wnętrza o wyraźnej tożsamości. Łączymy wrażliwość projektową z precyzją i doświadczeniem, tworząc przestrzenie dopracowane w detalu i osadzone w realnym kontekście.',
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
    src: '/images/dehesa.jpg',
    alt: 'delikatesy Dehesa',
  },
  {
    src: '/images/prs.jpg',
    alt: 'winobar Łódź',
  },
];
