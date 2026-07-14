import { makePageMetadata } from '@/lib/metadata';
import OfertaPage from './OfertaPage';

export const generateMetadata = makePageMetadata('oferta');

export default function Page() {
  return <OfertaPage />;
}
