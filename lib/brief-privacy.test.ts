import en from '@/messages/en.json';
import pl from '@/messages/pl.json';
import { describe, expect, it } from 'vitest';

describe('project enquiry privacy copy', () => {
  it('discloses provider handling and the email-app fallback in both notices', () => {
    expect(pl.brief.privacy.beforeLink).toContain('dostawca poczty');
    expect(pl.brief.privacy.beforeLink).toContain('programie pocztowym');
    expect(pl.brief.privacy.link).toBe('polityce prywatności');
    expect(en.brief.privacy.beforeLink).toContain('email provider');
    expect(en.brief.privacy.beforeLink).toContain('email app');
    expect(en.brief.privacy.link).toBe('privacy policy');
  });

  it('names Resend and covers optional phone and plan links in the full policy', () => {
    expect(pl.privacy.contactBody).toContain('Resend');
    expect(pl.privacy.contactBody).toContain('opcjonalny numer telefonu');
    expect(pl.privacy.contactBody).toContain('link do rzutów lub zdjęć');
    expect(en.privacy.contactBody).toContain('Resend');
    expect(en.privacy.contactBody).toContain('optional phone number');
    expect(en.privacy.contactBody).toContain('link to plans or photos');
  });
});
