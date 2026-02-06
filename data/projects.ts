export interface Project {
  id: number;
  title: string;
  category: 'mieszkalne' | 'komercyjne' | 'hotele' | 'gastronomia';
  status: string;
  images: string[];
}

export const projects: Project[] = [
  {
    id: 1,
    title: "hotel Belmonte Ustronie Morskie",
    category: "hotele",
    status: "under construction",
    images: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600&h=600&fit=crop"
    ]
  },
  {
    id: 2,
    title: "pawilon usługowy Fandom",
    category: "komercyjne",
    status: "under construction",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&h=600&fit=crop"
    ]
  },
  {
    id: 3,
    title: "apartament Grabiszynek",
    category: "mieszkalne",
    status: "realizacja 2024",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&h=600&fit=crop"
    ]
  },
  {
    id: 4,
    title: "restauracja Umami",
    category: "gastronomia",
    status: "realizacja 2023",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop"
    ]
  },
  {
    id: 5,
    title: "loft Nadodrze",
    category: "mieszkalne",
    status: "realizacja 2024",
    images: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=600&fit=crop"
    ]
  },
  {
    id: 6,
    title: "butik hotelowy Marina",
    category: "hotele",
    status: "realizacja 2023",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=600&fit=crop"
    ]
  }
];

export const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&h=1067&fit=crop",
    title: "apartament Centrum"
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=1067&fit=crop",
    title: "biuro Skyline"
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=1067&fit=crop",
    title: "rezydencja Park"
  }
];
