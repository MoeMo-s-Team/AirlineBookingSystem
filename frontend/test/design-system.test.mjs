import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('tokens.css: border-radius matches DESIGN.md', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/styles/tokens.css'), 'utf-8');
  assert.match(content, /--radius-sm:\s*0\.125rem;/);
  assert.match(content, /--radius:\s*0\.25rem;/);
  assert.match(content, /--radius-md:\s*0\.375rem;/);
  assert.match(content, /--radius-lg:\s*0\.5rem;/);
  assert.match(content, /--radius-xl:\s*0\.75rem;/);
  assert.match(content, /--radius-full:\s*9999px;/);
});

test('tokens.css: margin-mobile spacing token exists', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/styles/tokens.css'), 'utf-8');
  assert.match(content, /--spacing-margin-mobile:\s*1rem;/);
});

test('tailwind.config.js: includes margin-mobile and full radius', async () => {
  const tailwindConfigPath = path.join(rootDir, 'tailwind.config.js');
  const tailwindModule = await import(tailwindConfigPath);
  const config = tailwindModule.default;
  const extend = config.theme.extend;

  assert.equal(extend.spacing['margin-mobile'], 'var(--spacing-margin-mobile)');
  assert.equal(extend.borderRadius.md, 'var(--radius-md)');
  assert.equal(extend.borderRadius.lg, 'var(--radius-lg)');
  assert.equal(extend.borderRadius.xl, 'var(--radius-xl)');
  assert.equal(extend.borderRadius.full, 'var(--radius-full)');
});

test('tailwind.config.js: typography includes lineHeight, letterSpacing, fontWeight', async () => {
  const tailwindConfigPath = path.join(rootDir, 'tailwind.config.js');
  const tailwindModule = await import(tailwindConfigPath);
  const config = tailwindModule.default;
  const extend = config.theme.extend;

  const displayHero = extend.fontSize['display-hero'];
  assert.ok(Array.isArray(displayHero), 'display-hero fontSize should be an array/tuple');
  assert.equal(displayHero[0], 'var(--font-size-display-hero)');
  assert.equal(displayHero[1].lineHeight, '56px');
  assert.equal(displayHero[1].fontWeight, '700');
  assert.equal(displayHero[1].letterSpacing, '-0.02em');

  const labelCode = extend.fontSize['label-code'];
  assert.ok(Array.isArray(labelCode), 'label-code fontSize should be an array/tuple');
  assert.equal(labelCode[1].letterSpacing, '0.04em');
});

test('styles/index.css: no arbitrary hardcoded hex in component classes', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/styles/index.css'), 'utf-8');
  const componentLayerMatch = content.match(/@layer components\s*\{([\s\S]*)\}/);
  assert.ok(componentLayerMatch, '@layer components should exist');
  const componentLayer = componentLayerMatch[1];
  assert.doesNotMatch(componentLayer, /#1976D2/i, 'Should not have hardcoded #1976D2');
  assert.doesNotMatch(componentLayer, /#0D47A1/i, 'Should not have hardcoded #0D47A1');
  assert.doesNotMatch(componentLayer, /#90CAF9/i, 'Should not have hardcoded #90CAF9');
});
