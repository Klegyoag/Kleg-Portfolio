# Full-stack portfolio refresh — 28 November 2026

This package is the supplied Angular repository snapshot with the full-stack update already applied. No update script needs to be run. The existing editorial design, routing, portrait, animation and Supabase security configuration are retained. The root legacy static HTML files are retained; the deployed Angular entrypoint is `src/index.html` per `angular.json` and `vercel.json`.

## What changed

- Homepage, about, six service areas, skills, journey, contact options, assistant knowledge and SEO now focus on full-stack software development.
- Nine project records with technology tags, status, problem, contribution, architecture and verification details. Five are marked featured. Project cards use editorial text artwork where no screenshots are available; no simulated screenshots or invented release claims are included.
- Fifteen evidence-based skill entries, without fabricated proficiency percentages.
- The project detail template and admin editor expose the additional case-study fields.
- WAVE is an organization project in development, with individual contribution unverified. SEVPMS is a team starter. Other development, staging and prototype statuses are explicitly identified. BuildMind is excluded because its source could not be accessed.

## Build and preview

Use the Node version required by the existing `package.json`: Node 22.22.3 or a compatible later version in the declared engine range (for example 24.15.0 or later within the 24.x line). In the extracted repository root:

```sh
npm ci
npm run test:types
npm run build
npm start
```

Open the local address shown by Angular. Check the homepage, project detail routes, skills, mobile layout and admin preview. The supplied package and lockfile were not altered.

To deploy, copy the updated files into your existing Git clone (preserving its `.git` directory), create a feature branch, review the diff and commit the changes. Verify the Vercel preview before merging into the production branch. This ZIP itself does not contain Git history and was not deployed.

## Important: publish the updated CMS content too

The Supabase `published` payload takes priority over bundled defaults. Existing published records may therefore continue to show old text even after the source is deployed.

1. Open the admin dashboard at `/admin` and sign in.
2. Export your current draft as a backup. If the published version contains edits not in the draft, preserve that version as well using the available revision history.
3. Import `cms-import/portfolio-full-stack-2026-11-28.json`. This is a complete content snapshot based on the supplied source, not a selective merge with live data. Importing it replaces the current draft. Restore any personal customizations, actual screenshots, links or other changes you want to keep from your backup.
4. Review the draft and preview, save it, and publish only when satisfied. Publishing changes shared CMS content immediately; deploy the updated code before publishing so the case-study fields are visible.

## Validation performed

- Applied the refresh against the exact supplied project archive.
- Parsed changed TypeScript files successfully with the installed TypeScript parser (syntax only).
- Verified the generated JSON matches the updated default-content data exactly, contains nine project records and fifteen skill entries, and is below the dashboard's 1 MB import limit.
- Verified the original image assets are byte-for-byte unchanged.
- A full Angular build/browser test could not be performed here: the environment uses Node 22.16.0 and offline npm installation failed because dependencies were not cached. Run the build commands above before deploying.
- No GitHub, Vercel or Supabase remote write was performed.
