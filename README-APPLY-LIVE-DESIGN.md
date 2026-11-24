# KLEGAR PORTFOLIO — RESTORE THE DESIGN ON YOUR LIVE WEBSITE

## Why the deployed site still looks black and red
The last merged GitHub pull request updated default-content.ts and metadata but did **not** change the Angular homepage template or styles. The GitHub main branch still referenced the old black/red layout. A Vercel deployment of that branch faithfully served the old layout.

This patch is specifically designed to be applied ON TOP OF the current main branch after the profile-refresh pull request has been merged. It does NOT overwrite the content update in src/app/data/default-content.ts. The design it restores is the approved warm cream / maroon editorial fullscreen homepage, frameless transparent portrait, and smooth scroll dissolve. The About, projects, services, skills, journey, contact, routing, and admin remain.

## 1. Apply locally to a NEW branch

Open Windows CMD, not inside the extracted ZIP:

    cd /d "%USERPROFILE%\Documents\Kleg-Portfolio"
    git status
    git switch main
    git pull --ff-only origin main
    git switch -c fix/restore-final-portfolio-design

Ensure the ZIP is in Downloads. Extract the files into the REPOSITORY ROOT:

    tar -xf "%USERPROFILE%\Downloads\Klegar_Live_Design_Restoration_Patch.zip" -C "%CD%"

Then run:

    npm install
    npm run build
    npm start

Check http://localhost:4200/home on desktop and mobile. Stop server with Ctrl+C.

## 2. Confirm you got the right version

Open src/app/components/portfolio.component.html and look for:

    <div class="nv-root at-root"

Open angular.json and check its styles array contains:

    "src/styles/atelier.css",
    "src/styles/hero-dissolve.css"

Check the image exists:

    src/assets/klegar-hero-transparent-v4.png

The new main hero uses a separate transparent image field, so the old published portraitUrl should not replace it.

## 3. Push and deploy

    git add -A
    git commit -m "fix: restore cream maroon portfolio design and transparent hero"
    git push -u origin fix/restore-final-portfolio-design

Open a GitHub pull request from fix/restore-final-portfolio-design into main. Inspect the Vercel Preview (new design and responsive behavior) and merge after checks succeed. Vercel's Production deployment should be on the NEW merge commit. Do not force push.

## 4. Why the text may still be old

The Angular site uses Supabase published content ahead of bundled defaults. Your last PR changed bundled defaults but cannot overwrite an already published CMS payload automatically.

After you confirm the design deployment:
1. Visit https://kleg-portfolio.vercel.app/admin
2. Export/backup your currently published CMS content BEFORE replacing it.
3. Import the accompanying JSON file, `Klegar_Updated_CMS_Content_Import.json` (available as a separate download or in the patch at cms-import/portfolio-cms-import-2026-11-24.json).
4. Review and adjust ALL fields, particularly personal details, your custom content, projects, photos and contact links.
5. Save Draft, Preview and Publish.

Importing this JSON is a complete content replacement; it is not a selective merge. Keep your backup and do not publish unless satisfied.

## Validation

The patch includes only the files listed below. It retains the existing profile-refresh main source data. Files and CSS were syntax-checked and the portrait verified to include transparency. A full Angular/Vercel browser-build test still needs to be done on your computer; do not merge before testing.

## Included file list

- angular.json (registers new public styles)
- src/app/app.routes.ts (existing clean URLs and retired-section redirects)
- src/app/components/portfolio.component.ts (new hero and scroll handling)
- src/app/components/portfolio.component.html (new public website layout)
- src/app/admin/editor-schema.ts (new hero fields editable in CMS)
- src/styles/atelier.css (new public site design)
- src/styles/hero-dissolve.css (fullscreen portrait and motion)
- src/assets/klegar-hero-transparent-v4.png (transparent portrait)
- cms-import/portfolio-cms-import-2026-11-24.json (optional, full CMS content update)
