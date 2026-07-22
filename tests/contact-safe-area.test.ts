import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/FooterBar.tsx', import.meta.url), 'utf8');
const transition = readFileSync(new URL('../components/PageTransition.tsx', import.meta.url), 'utf8');
const navbar = readFileSync(new URL('../components/Navbar.tsx', import.meta.url), 'utf8');

test('contact wipe leaves the iOS status safe area beige', () => {
  assert.match(globals, /html,\s*body\s*\{[^}]*background-color: #E5DDD0;/);
  assert.match(transition, /top-\[env\(safe-area-inset-top\)\]/);
  assert.match(transition, /calc\(var\(--nav-orb-center-y\) - env\(safe-area-inset-top\)\)/);
  assert.match(transition, /fixed inset-x-0 bottom-0/);
  assert.doesNotMatch(transition, /fixed inset-0 z-\[90\] bg-coral/);
  assert.match(navbar, /fixed inset-x-0 top-0 h-dvh z-\[100\] bg-coral/);
});

test('fixed footer remains transparent while covering the bottom safe area', () => {
  assert.match(footer, /fixed inset-x-0 bottom-0 z-40 bg-transparent pb-\[env\(safe-area-inset-bottom\)\]/);
  assert.doesNotMatch(footer, /fixed inset-x-0 bottom-0 z-40 bg-beige/);
});
