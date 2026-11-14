import { useSyncExternalStore } from 'react';
import uiMessages from './messages.json';
import systemMessages from './systemMessages.json';

const messages = { ...uiMessages, ...systemMessages };

export type Language = 'en' | 'vi';
const storageKey = 'skywing.language';
const listeners = new Set<() => void>();
function initialLanguage(): Language {
  try { return localStorage.getItem(storageKey) === 'vi' ? 'vi' : 'en'; } catch { return 'en'; }
}
let language: Language = initialLanguage();
export const getLanguage = () => language;
export const getLocale = () => language === 'vi' ? 'vi-VN' : 'en-US';
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

export function setLanguage(next: Language) {
  language = next;
  try { localStorage.setItem(storageKey, next); } catch { /* Language switching also works without storage. */ }
  if (typeof document !== 'undefined') document.documentElement.lang = next;
  listeners.forEach(listener => listener());
}

export function useLanguage() {
  return useSyncExternalStore(subscribe, getLanguage, () => 'en' as const);
}

if (typeof document !== 'undefined') document.documentElement.lang = language;
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key === storageKey) setLanguage(event.newValue === 'vi' ? 'vi' : 'en');
});

type Message = readonly [string, string];
const exact = new Map<string, Message>();
const caseInsensitive = new Map<string, Message>();
const patterns: Array<{ expression: RegExp; message: Message; positions: number[] }> = [];
const normalize = (value: string) => value.trim().replace(/\s+/g, ' ');
for (const [source, translations] of Object.entries(messages)) {
  const pair = translations as unknown as Message;
  for (const alias of new Set([source, ...pair])) {
    const key = normalize(alias);
    if (!/\{\d+\}/.test(key)) {
      exact.set(key, pair);
      caseInsensitive.set(key.toLowerCase(), pair);
    }
    else {
      const escaped = key.split(/\{\d+\}/).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(.+?)');
      const positions = [...key.matchAll(/\{(\d+)\}/g)].map(match => Number(match[1]));
      patterns.push({ expression: new RegExp(`^${escaped}$`), message: pair, positions });
    }
  }
}

/** Translate displayed copy only; API identifiers, form values and route values stay intact. */
export function localize<T>(value: T): T {
  if (typeof value !== 'string' || !value.trim()) return value;
  const source = normalize(value);
  const index = language === 'vi' ? 1 : 0;
  let translated = (exact.get(source) ?? caseInsensitive.get(source.toLowerCase()))?.[index];
  if (translated === undefined) {
    for (const pattern of patterns) {
      const match = pattern.expression.exec(source);
      if (!match) continue;
      translated = pattern.message[index].replace(/\{(\d+)\}/g, (_, position: string) => localize(match[pattern.positions.indexOf(Number(position)) + 1] ?? ''));
      break;
    }
  }
  if (translated === undefined) return value;
  return (value.match(/^\s*/)?.[0] + translated + value.match(/\s*$/)?.[0]) as T;
}
