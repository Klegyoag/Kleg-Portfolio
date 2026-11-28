import { deepClone, mergeContent, PortfolioContent, safeUrl, slugify } from '../models/content';

/** Legacy CMS snapshots predate the full-stack refresh. The marker lives in JSON,
 * so no database schema changes or automatic remote writes are required. */
export const CONTENT_REVISION = 20261128;

export function needsContentRefresh(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const revision = (payload as Partial<PortfolioContent>).site?.['contentRevision'];
  return typeof revision !== 'number' || !Number.isFinite(revision) || revision < CONTENT_REVISION;
}

function repositoryKey(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\/+$/, '').replace(/\.git$/i, '').toLowerCase() : '';
}

/** Old snapshots may contain empty arrays or stale text. Refresh those sections
 * while retaining contact settings, custom projects and explicit visibility choices.
 * Current-version snapshots remain fully editable, even if an admin removes every project. */
export function resolvePortfolioContent(defaults: PortfolioContent, payload: unknown): PortfolioContent {
  if (!needsContentRefresh(payload)) return mergeContent(defaults, payload);
  const legacy = mergeContent(defaults, payload);
  const next = deepClone(defaults);
  const raw = payload as Partial<PortfolioContent>;
  for (const key of ['ownerName', 'shortName', 'whatsappNumber', 'whatsappDisplay', 'githubUrl', 'linkedinUrl', 'instagramUrl', 'portraitUrl', 'heroCutoutUrl', 'cvUrl']) {
    const value = raw.site?.[key];
    if (typeof value === 'string') next.site[key] = value;
  }
  // The refresh deliberately uses the verified broad location and new professional role.
  for (const key of ['budgetOptions', 'timelineOptions', 'stageOptions']) {
    if (Array.isArray(raw.contact?.[key])) next.contact[key] = deepClone(legacy.contact[key]);
  }
  if (typeof raw.seo?.['ogImage'] === 'string' && raw.seo['ogImage'].trim()) next.seo['ogImage'] = raw.seo['ogImage'];
  const previous: any[] = Array.isArray(raw.projects?.['items']) ? raw.projects['items'].filter((item: any) => item && typeof item.title === 'string' && item.title.trim()) : [];
  const consumed = new Set<any>();
  next.projects['items'] = (next.projects['items'] || []).map((project: any) => {
    const repo = repositoryKey(project.githubUrl);
    const match = previous.find(item => !consumed.has(item) && ((repo && repositoryKey(item.githubUrl) === repo) || slugify(item.title) === slugify(project.title)));
    if (!match) return project;
    consumed.add(match);
    // Keep custom media and links, but use refreshed verified descriptions and stack.
    if (typeof match.imageUrl === 'string' && match.imageUrl.trim()) project.imageUrl = match.imageUrl;
    if (safeUrl(match.liveUrl)) project.liveUrl = match.liveUrl;
    if (match.visible === false) project.visible = false;
    return project;
  });
  for (const item of previous) {
    if (!consumed.has(item)) next.projects['items'].push(deepClone(item));
  }
  next.site['contentRevision'] = CONTENT_REVISION;
  return next;
}
