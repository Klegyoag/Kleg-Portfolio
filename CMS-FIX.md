# Full-stack content visibility fix — 28 November 2026

The previous package refreshed bundled Angular content, but an old Supabase `published` payload replaced its arrays with empty projects and six legacy skills. This version checks a content revision marker in `site.contentRevision` and refreshes legacy content at read time, on both localhost and production, including project detail pages. No database schema changes, credential changes or automatic database writes are made.

## Run

Extract this ZIP into a fresh folder, stop the old dev server, then run `npm ci`, `npm run build`, `npm start` with a compatible Node.js version. Open `http://localhost:4200/projects` and `http://localhost:4200/skills`. With the legacy snapshot, nine projects and 15 skill entries should now appear without importing anything first. Intentional hidden projects and extra manually added projects may change the visible count.

## CMS

The admin dashboard loads the same refreshed content, retains the raw old draft/published snapshots for export, and shows a warning. Export old snapshots before saving; review the refreshed draft; then save and publish if desired. Old descriptions, skill lists, services, project descriptions and other refreshed copy are superseded on read; contact identity/links, images, existing matching project media/live links/hidden flags, additional projects, and form option settings are retained as described in the resolver. A current-version published snapshot remains authoritative, including intentional empty lists. Importing or restoring an older backup explicitly through the admin can intentionally restore previous content; use the updated import to restore the full-stack refresh. No live Supabase data was accessed or modified for this fix.

## Regression test

From the repository root, with TypeScript installed:

```sh
npx tsc src/app/data/resolve-content.ts src/app/data/default-content.ts src/app/models/content.ts --target ES2022 --module commonjs --outDir .content-test --skipLibCheck
node tests/content-refresh.test.cjs .content-test
```

Tests exercise actual legacy bundled data, current CMS payloads (including intentionally empty arrays), preservation of custom projects/media and the updated import. A full Angular build and browser check remain required.
