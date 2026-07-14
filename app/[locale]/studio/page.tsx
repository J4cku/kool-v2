import { makePageMetadata } from '@/lib/metadata';
import StudioPage from './StudioPage';

export const generateMetadata = makePageMetadata('studio');

export default function Page() {
  return <StudioPage />;
}
