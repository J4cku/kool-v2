import { render, screen } from '@testing-library/react';
import { createElement, type ComponentProps, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Navbar from '@/components/Navbar';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
});

vi.mock('next/image', () => ({
  default: ({ priority: _, ...props }: ComponentProps<'img'> & { priority?: boolean }) => <img {...props} />,
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
  usePathname: () => '/',
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: new Proxy({}, {
    get: (_, tag) => ({
      animate: _animate,
      exit: _exit,
      initial: _initial,
      transition: _transition,
      whileFocus: _whileFocus,
      whileHover: _whileHover,
      children,
      ...props
    }: ComponentProps<'span'> & { children?: ReactNode }) => createElement(String(tag), props, children),
  }),
  useScroll: () => ({ scrollY: 0 }),
  useReducedMotion: () => false,
  useSpring: (value: number) => value,
  useTransform: () => 1,
}));

describe('Navbar desktop links', () => {
  it('provides one accessible label and two hidden rollover rows', () => {
    render(<Navbar />);

    const projectLink = screen.getByRole('link', { name: 'projekty' });

    expect(projectLink.getAttribute('aria-label')).toBe('projekty');
    expect(projectLink.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });
});
