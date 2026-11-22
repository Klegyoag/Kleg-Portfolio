export type Entry = Record<string, any>;
export interface PortfolioContent {
  site: Entry;
  hero: Entry;
  about: Entry;
  services: Entry;
  skills: Entry;
  journey: Entry;
  projects: Entry;
  contact: Entry;
  extras: Entry;
  assistant: Entry;
  seo: Entry;
}
export type SectionKey = keyof PortfolioContent;
export interface CmsRow { key: string; payload: PortfolioContent; updated_at?: string; }
export interface Revision { id: string; payload: PortfolioContent; published_at: string; }
export function deepClone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
export function mergeContent(defaults: PortfolioContent, overrides: unknown): PortfolioContent {
  const input = overrides && typeof overrides === 'object' && !Array.isArray(overrides) ? overrides as Record<string, unknown> : {};
  const copy = deepClone(defaults);
  for (const key of Object.keys(defaults) as SectionKey[]) {
    const part = input[key];
    if (part && typeof part === 'object' && !Array.isArray(part)) {
      copy[key] = { ...copy[key], ...part };
    }
  }
  return copy;
}
export function slugify(text: string): string {
  return String(text || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
}
export function safeUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const value = raw.trim();
  if (!value) return '';
  if (/^https:\/\//i.test(value)) return value;
  if (/^\/(?!\/)[a-zA-Z0-9_./-]+$/.test(value)) return value;
  return '';
}
export function assetUrl(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) return '';
  const value = raw.trim();
  if (/^[a-z\w-]+\.(webp|png|svg|jpe?g|gif|pdf)$/i.test(value)) return `/assets/${value}`;
  return safeUrl(value);
}
