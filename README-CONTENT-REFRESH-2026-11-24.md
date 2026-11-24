# Klegar Portfolio — Evidence-based content refresh (24 November 2026)

This updates the **text and CMS content**, not the home design, transparent portrait, animations, routes or administrator permissions.

## Verified sources used

- https://github.com/Klegyoag/klegyoag (public self-description and broad technology list)
- https://github.com/Klegyoag/Daynix (Flutter/Android source and test build notes)
- https://github.com/Klegyoag/Nvent-Final-Check (SEVPMS team assignment and **starter** architecture)
- https://github.com/Klegyoag/143 (integrated Flutter/Laravel/link-site source, verification limits)
- https://github.com/Klegyoag/143-backend-staging (Laravel/PostgreSQL documented backend; staging status)
- https://github.com/Klegyoag/Kleg-Portfolio (Angular + Supabase CMS)
- https://github.com/Klegyoag/Muncif-Portfolio (Angular portfolio source)
- https://www.linkedin.com/in/chris-klegar-yoag-51b98441b/ (verified **link**, not profile details)

LinkedIn's actual About, Experience, Education and Certification sections were not accessible publicly in this environment. No titles, dates, degrees or certifications were fabricated. The GitHub profile lists a very broad technology collection; this update focuses on technologies corroborated by specific repositories and never represents badge lists as proof of proficiency.

## Two steps for the update to appear on the live site

**1. Deploy updated source:** Git branch/PR, run `npm install` and `npm run build`, test Vercel Preview, then merge.

**2. Publish to Supabase CMS:** If you previously published content with Portfolio Studio, Supabase `cms_content` with key `published` takes priority over local defaults. Log in at `/admin/login` → open dashboard → **Import JSON backup** (label varies slightly) → choose `portfolio-cms-import-2026-11-24.json` from the root of this project → review every section → **Save Draft** → **Publish Changes**.

Importing a full backup replaces your **current draft**. Export your existing draft from the dashboard **before importing** if you've made edits worth retaining. Publishing affects the live Supabase content immediately and may also affect Vercel preview sites using that database. The import is under 1 MB and matches the CMS schema. New projects use no invented screenshots.

This is not a GitHub-to-Supabase automatic sync. The content snapshot is dated 2026-11-24; future repository changes need another refresh or editing in the CMS.

## Project status matters

DAYNIX and 143 have documented development/test source; SEVPMS explicitly describes an architecture starter; the 143 Laravel backend requires runtime/provider validation. We do **not** claim app-store or production deployment for them. Muncif Portfolio's repository is on the supplied GitHub account but this does not establish the extent of an individual's contribution. Project descriptions are intentionally conservative.

## Changed files

- `src/app/data/default-content.ts` — new copy, skills, projects, journey, FAQ and SEO fields
- `src/index.html` — fallback meta description
- `portfolio-cms-import-2026-11-24.json` — full CMS draft for manual import

No Supabase credentials or account secrets are packaged.
