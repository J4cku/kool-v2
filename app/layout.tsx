import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kool Studio | Architektura Wnętrz Wrocław',
  description: 'Kool Studio - pracownia architektury wnętrz. Projektowanie przestrzeni mieszkalnych, komercyjnych i hotelowych we Wrocławiu.',
  keywords: 'architektura wnętrz, projektowanie wnętrz, Wrocław, design, interior design',
  openGraph: {
    title: 'Kool Studio | Architektura Wnętrz Wrocław',
    description: 'Pracownia architektury wnętrz. Projektowanie przestrzeni mieszkalnych, komercyjnych i hotelowych.',
    type: 'website',
    locale: 'pl_PL',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="bg-beige text-dark antialiased">
        {children}
      </body>
    </html>
  );
}
