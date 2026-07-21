import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement, type ComponentProps, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Navbar from '@/components/Navbar';

type MotionSpanProps = ComponentProps<'span'> & Record<string, unknown>;

const motionPropNames = new Set(['animate', 'exit', 'initial', 'transition', 'whileFocus', 'whileHover']);
const motionState = vi.hoisted(() => ({ reducedMotion: false }));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
});

vi.mock('next/image', () => ({
  default: () => null,
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
    get: (_, tag) => ({ animate, children, transition, ...props }: MotionSpanProps) => {
      motionPropNames.forEach((propName) => delete props[propName]);
      const y = typeof (animate as { y?: unknown })?.y === 'string'
        ? (animate as { y: string }).y
        : undefined;
      const animation = transition as { delay?: number; duration?: number; ease?: unknown } | undefined;
      return createElement(String(tag), {
        ...props,
        'data-motion-delay': animation?.delay,
        'data-motion-duration': animation?.duration,
        'data-motion-ease': animation?.ease ? JSON.stringify(animation.ease) : undefined,
        'data-motion-y': y,
      }, children);
    },
  }),
  useScroll: () => ({ scrollY: 0 }),
  useReducedMotion: () => motionState.reducedMotion,
  useSpring: (value: number) => value,
  useTransform: () => 1,
}));

afterEach(() => {
  cleanup();
  motionState.reducedMotion = false;
});

describe('Navbar desktop links', () => {
  it('provides one accessible label and two hidden rollover rows', () => {
    render(<Navbar />);

    const projectLink = screen.getByRole('link', { name: 'projekty' });
    const rows = projectLink.querySelectorAll('[aria-hidden="true"]');

    expect(projectLink.getAttribute('aria-label')).toBe('projekty');
    expect(rows).toHaveLength(2);
    expect(rows[0].firstElementChild?.getAttribute('data-motion-duration')).toBe('0.45');
    expect(rows[0].firstElementChild?.getAttribute('data-motion-ease')).toBe('[0.22,1,0.36,1]');
    expect(rows[0].children[1].getAttribute('data-motion-delay')).toBe('0.015');
  });

  it('keeps rollover active until both hover and focus end', () => {
    render(<Navbar />);

    let projectLink = screen.getByRole('link', { name: 'projekty' });
    fireEvent.mouseOver(projectLink);

    projectLink = screen.getByRole('link', { name: 'projekty' });
    let rows = projectLink.querySelectorAll('[aria-hidden="true"]');
    expect(rows[0].firstElementChild?.getAttribute('data-motion-y')).toBe('-100%');

    fireEvent.focus(projectLink);
    projectLink = screen.getByRole('link', { name: 'projekty' });
    fireEvent.mouseOut(projectLink);

    projectLink = screen.getByRole('link', { name: 'projekty' });
    rows = projectLink.querySelectorAll('[aria-hidden="true"]');
    expect(rows[0].firstElementChild?.getAttribute('data-motion-y')).toBe('-100%');
    expect(rows[1].firstElementChild?.getAttribute('data-motion-y')).toBe('0%');

    fireEvent.blur(projectLink);

    projectLink = screen.getByRole('link', { name: 'projekty' });
    rows = projectLink.querySelectorAll('[aria-hidden="true"]');
    expect(rows[0].firstElementChild?.getAttribute('data-motion-y')).toBe('0%');
    expect(rows[1].firstElementChild?.getAttribute('data-motion-y')).toBe('100%');
  });

  it('keeps rollover rows static for reduced-motion users', () => {
    motionState.reducedMotion = true;
    render(<Navbar />);

    const projectLink = screen.getByRole('link', { name: 'projekty' });
    fireEvent.mouseOver(projectLink);

    const rows = projectLink.querySelectorAll('[aria-hidden="true"]');
    expect(rows[0].firstElementChild?.getAttribute('data-motion-y')).toBe('0%');
    expect(rows[1].firstElementChild?.getAttribute('data-motion-y')).toBe('100%');
  });
});
