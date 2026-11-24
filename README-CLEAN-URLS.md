# Klegar Portfolio — Clean Angular URLs Patch

This patch is based on the existing `Klegyoag/Kleg-Portfolio` Angular project.
It changes old hash anchors like `/#contact` into clean section URLs like `/contact`.
It preserves the current long single-page layout: /about scrolls to the About section,
/contact scrolls to the contact form, etc. It does not create separate page layouts.

## Files changed (five)
- `src/app/app.routes.ts` — allow the section paths and preserve admin/project routing
- `src/app/components/portfolio.component.ts` — navigate and scroll on routed sections
- `src/app/components/portfolio.component.html` — replace section anchors with clean URLs
- `src/app/components/project-detail.component.ts` — return to /home instead of /
- `src/main.ts` — turn off conflicting router automatic scroll restoration

No Supabase credentials, database code, CSS, images, or dashboard files are changed.

## Apply using Windows PowerShell (from your Git repository)
1. Ensure you have the repo at `C:\Users\enokb\Documents\Kleg-Portfolio`.
2. From `main`, create a fresh branch (recommended):
   `git switch main`
   `git pull origin main`
   `git switch -c feat/clean-angular-urls`
3. Extract this ZIP into the repository ROOT, keeping its folder structure.
   PowerShell example (adjust Downloads path to where you saved the ZIP):
   `Expand-Archive -LiteralPath "$HOME\Downloads\Klegar_Angular_Clean_URLs_Patch.zip" -DestinationPath (Get-Location).Path -Force`
4. Run `npm install` (if needed), `npm run build`, and `npm start`.
5. Test `/home`, `/about`, `/projects`, `/contact` and refresh `/contact` in the browser.
   Also test `/admin/login` and `/projects/<your-actual-project-slug>`.
6. Commit and push:
   `git add src/app/app.routes.ts src/app/components/portfolio.component.ts src/app/components/portfolio.component.html src/app/components/project-detail.component.ts src/main.ts`
   `git commit -m "feat: add clean Angular section URLs"`
   `git push -u origin feat/clean-angular-urls`
7. In GitHub open a pull request into `main`. After Vercel preview is tested, merge.

## Expected result
- https://kleg-portfolio.vercel.app/home
- https://kleg-portfolio.vercel.app/about
- https://kleg-portfolio.vercel.app/services
- https://kleg-portfolio.vercel.app/skills
- https://kleg-portfolio.vercel.app/projects
- https://kleg-portfolio.vercel.app/journey
- https://kleg-portfolio.vercel.app/contact
- `/` redirects to `/home`.
- Existing deep links `/projects/:slug`, `/admin`, `/admin/login` stay intact.
- The skip-to-content keyboard accessibility link retains `#mainContent` by design.

## Notes
This is a source-checked patch, NOT a fully compiled/angular-browser-tested release:
run `npm run build` on your machine and verify the Vercel Preview before merging.
Vercel needs the SPA fallback rewrite already present in your existing `vercel.json`.
