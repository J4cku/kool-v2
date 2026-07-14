export type PressItemKey =
  | 'labelDehesa'
  | 'whitemadDehesa'
  | 'labelGuide'
  | 'plndesignOffice';

export type PressItem = {
  key: PressItemKey;
  publication: string;
  href: string;
  image: string;
};

// Press features shown on the studio page and listed in /llms.txt
// (titles/alt texts live in messages/*.json under studio.press.items)
export const pressItems: PressItem[] = [
  {
    key: 'labelDehesa',
    publication: 'Label Magazine',
    href: 'https://label-magazine.com/wnetrza/artykuly/delikatesy-iberyjskie-we-wroclawiu-wypelnily-je-kolory-jak-z-filmow-almodovara',
    image: '/images/studio/press-label-dehesa.webp',
  },
  {
    key: 'whitemadDehesa',
    publication: 'WhiteMAD',
    href: 'https://www.whitemad.pl/delikatesy-we-wroclawiu-dehesa/',
    image: '/images/studio/press-whitemad-dehesa.webp',
  },
  {
    key: 'labelGuide',
    publication: 'Label Magazine',
    href: 'https://label-magazine.com/sklep/ksiazki/polska-miejski-przewodnik',
    image: '/images/studio/press-label-guide.webp',
  },
  {
    key: 'plndesignOffice',
    publication: 'PLNdesign.pl',
    href: 'https://plndesign.pl/wnetrza/architektki-urzadzily-kancelarie-na-19-m2-we-wroclawiu-zaczely-od-pytania/',
    image: '/images/studio/press-plndesign-kancelaria.webp',
  },
];
