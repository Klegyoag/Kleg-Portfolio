# Klegar Portfolio — Angular Edition

A complete Angular + TypeScript migration of the original Chris Klegar Yoag portfolio, with a responsive public site, project details, a Supabase-powered admin dashboard, drafts, publishing, revision history, media uploads, and a portfolio FAQ assistant.

**Source:** Adapted from the uploaded Kleg-Portfolio static site and Portfolio Studio CMS source. Original design tokens, colour themes, profile asset, site data, content sections, and Supabase table names are reused.

## What is included

- Angular standalone-component website with homepage sections: hero, About story tabs, services, projects, skills, timeline, UI comparison, interactive design lab, working principles, contact form, FAQ assistant, theme switching, and footer.
- Dynamic project details at `/projects/:slug`.
- Responsive mobile/tablet/desktop styling, including fixes for the previously oversized contact checkbox and mobile hero layout.
- Protected admin login at `/admin/login` and dashboard at `/admin`.
- Edit 11 content groups: identity/profile, hero, about, projects, services, skills, journey, contact, design extras, assistant and SEO.
- Add, remove, and reorder items; upload images and a PDF CV (5 MB limit); save unpublished drafts; preview; publish; export/import JSON backups; restore older versions into draft.
- Existing default content including the original assistant knowledge, under `src/app/data/default-content.ts`.
- Supabase SQL schema under `supabase/001_portfolio_cms.sql`.

## Requirements

- Node.js **22.22.3+ (22.x)**, **24.15.0+ (24.x)**, or **26.x**, as required by Angular 22. Check `node -v` before installing.
- npm, Git, GitHub and a Vercel project.
- Supabase project if using the online CMS. The public site works with bundled defaults if Supabase is not configured.

## 1. Install and run locally

```powershell
cd path\to\Klegar-Portfolio-Angular
npm install
npm start
```

Visit `http://localhost:4200`.

> Node dependencies are **not bundled** in this ZIP. The code package is intended for `npm install` on your computer or in Vercel. No database credentials are bundled.

## 2. Connect your existing Supabase project

If your existing Supabase CMS tables already exist, **reuse them**; don't create a second organization or project.

Open `src/environments.ts` and replace:

```ts
export const environment = {
  supabaseUrl: 'https://YOUR-PROJECT-REF.supabase.co',
  supabasePublishableKey: 'YOUR_PUBLIC_PUBLISHABLE_KEY'
};
```

Use the **publishable or anon key only** (not service_role, secret, or your database password). Supabase RLS is mandatory and supplied by the SQL schema.

If your tables do not exist yet: Open Supabase → SQL Editor and run `supabase/001_portfolio_cms.sql`. Create your admin Auth user in Authentication → Users, confirm it, then allowlist the real Auth user UUID:

```sql
insert into public.cms_admins (user_id)
values ('REPLACE_WITH_YOUR_AUTH_USER_UUID')
on conflict (user_id) do nothing;
```

Do not share passwords with anyone or put them in source control.

## 3. Test admin locally

Open `http://localhost:4200/admin/login`, sign in with the **Supabase Auth account** whose user ID exists in `cms_admins`.

- **Save draft** writes only `cms_content.key = 'draft'`.
- **Preview** renders that draft on your local browser.
- **Publish changes** updates `cms_content.key = 'published'` and attempts to record a revision.
- Public visitors read only `published` data, with the original site defaults as the fallback.
- Media uploads go into `portfolio-media` under a per-admin UID prefix, using Supabase Storage RLS rules.

## 4. Test the production build

```powershell
npm run build
```

The static website build should output files under `dist/klegar-portfolio/browser/`.

## 5. Push safely to GitHub

**Do not delete or overwrite your live production branch until you have tested a Vercel Preview.** Two options:

### Safest: create a new branch in your existing repository

```powershell
# From your clone of the existing GitHub repo
# First copy the Angular project files into this clone (replacing the old static site files).
git switch -c feat/angular-migration
git add .
git commit -m "feat: migrate portfolio and CMS to Angular"
git push -u origin feat/angular-migration
```

Open a pull request against your production branch (usually `main`). Vercel can generate a preview deployment from the branch before you merge.

### Alternative: test in a new GitHub repository

Create a separate repository for this Angular app, connect it to a separate Vercel preview project, and only change your main site after testing.

## 6. Configure Vercel

- Framework: Angular (automatic detection normally works).
- Build command: `npm run build`.
- Output directory: `dist/klegar-portfolio/browser`.
- Install command: `npm install`.
- Root directory: repo root containing `angular.json` and `package.json`.
- Keep `vercel.json`; its fallback rewrite supports Angular routes such as `/admin/login` and `/projects/example`.

If Vercel uses outdated overrides from the previous static deployment, update its project Build & Output settings to the Angular values above.

## 7. Test before merging

- Homepage loads, assets and Google Fonts load.
- Screen widths: 320px, 375px, 400px, 768px, 1024px, desktop.
- Menu, themes, About tabs, skills, design lab, assistant, project card links, contact form and checkbox.
- `/admin/login`: successful Auth login, rejected non-admin login, successful dashboard navigation.
- Save draft: public page unchanged.
- Draft preview displays unpublished edits.
- Publish updates public page; revision restores draft without publishing immediately.
- Check DevTools Console/Network for missing assets, Supabase or CORS errors.

## Design and data notes

- The original profile image is included at `src/assets/chris-klegar-profile.webp`.
- When `site.portraitUrl` is `chris-klegar-profile.webp`, Angular maps it to `/assets/chris-klegar-profile.webp`.
- The initial Projects array is intentionally empty, matching the source CMS: add real projects using the dashboard rather than inventing portfolio claims.
- Individual project URLs are derived from project titles; changing a title changes the slug. Avoid duplicate project titles.
- The FAQ assistant uses the original supplied question/answer library and keyword matching. It is not a generative AI API.
- Supabase URLs/keys in the client are public. Actual write security depends on RLS policies and allowlist, not hiding the dashboard URL or frontend source.
- The bundled site is an Angular **client-rendered** application. If you later need full SSR/prerendered SEO for every project page, that is a separate upgrade.

## Known verification limitation

This source package was assembled in a runtime where Angular packages could not be installed from npm because package registry network access was unavailable. Structural and syntax checks are performed, but an actual `npm install` and `npm run build` must be completed on a networked machine before production deployment. See `BUILD-CHECKLIST.md`.
