import { makePageMetadata } from '@/lib/metadata';
import KontaktPage from './KontaktPage';

export const generateMetadata = makePageMetadata('kontakt');

export default function Page() {
  return <KontaktPage />;
}
