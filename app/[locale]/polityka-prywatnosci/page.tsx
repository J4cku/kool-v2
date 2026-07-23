import { makePageMetadata } from '@/lib/metadata';
import PrivacyPage from './PrivacyPage';

export const generateMetadata = makePageMetadata('polityka-prywatnosci');

export default function Page() {
  return <PrivacyPage />;
}
