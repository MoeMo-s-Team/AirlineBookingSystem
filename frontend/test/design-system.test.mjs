import { test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('tokens.css: border-radius matches DESIGN.md', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/styles/tokens.css'), 'utf-8');
  expect(content).toMatch(/--radius-sm:\s*0\.125rem;/);
  expect(content).toMatch(/--radius:\s*0\.25rem;/);
  expect(content).toMatch(/--radius-md:\s*0\.375rem;/);
  expect(content).toMatch(/--radius-lg:\s*0\.5rem;/);
  expect(content).toMatch(/--radius-xl:\s*0\.75rem;/);
  expect(content).toMatch(/--radius-full:\s*9999px;/);
});

test('tokens.css: margin-mobile spacing token exists', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/styles/tokens.css'), 'utf-8');
  expect(content).toMatch(/--spacing-margin-mobile:\s*1rem;/);
});

test('tailwind.config.js: includes margin-mobile and full radius', async () => {
  const tailwindConfigPath = path.join(rootDir, 'tailwind.config.js');
  const tailwindModule = await import(tailwindConfigPath);
  const config = tailwindModule.default;
  const extend = config.theme.extend;

  expect(extend.spacing['margin-mobile']).toBe('var(--spacing-margin-mobile)');
  expect(extend.borderRadius.md).toBe('var(--radius-md)');
  expect(extend.borderRadius.lg).toBe('var(--radius-lg)');
  expect(extend.borderRadius.xl).toBe('var(--radius-xl)');
  expect(extend.borderRadius.full).toBe('var(--radius-full)');
});

test('tailwind.config.js: typography includes lineHeight, letterSpacing, fontWeight', async () => {
  const tailwindConfigPath = path.join(rootDir, 'tailwind.config.js');
  const tailwindModule = await import(tailwindConfigPath);
  const config = tailwindModule.default;
  const extend = config.theme.extend;

  const displayHero = extend.fontSize['display-hero'];
  expect(Array.isArray(displayHero)).toBe(true);
  expect(displayHero[0]).toBe('var(--font-size-display-hero)');
  expect(displayHero[1].lineHeight).toBe('56px');
  expect(displayHero[1].fontWeight).toBe('700');
  expect(displayHero[1].letterSpacing).toBe('-0.02em');

  const labelCode = extend.fontSize['label-code'];
  expect(Array.isArray(labelCode)).toBe(true);
  expect(labelCode[1].letterSpacing).toBe('0.04em');
});

test('styles/index.css: no arbitrary hardcoded hex in component classes', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/styles/index.css'), 'utf-8');
  const componentLayerMatch = content.match(/@layer components\s*\{([\s\S]*)\}/);
  expect(componentLayerMatch).toBeTruthy();
  const componentLayer = componentLayerMatch[1];
  expect(componentLayer).not.toMatch(/#1976D2/i);
  expect(componentLayer).not.toMatch(/#0D47A1/i);
  expect(componentLayer).not.toMatch(/#90CAF9/i);
});
