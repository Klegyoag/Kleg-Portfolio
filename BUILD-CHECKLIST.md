# Build and acceptance checklist

1. Run `node -v` (Node >=22.22.3 (22.x), >=24.15.0 (24.x), or 26.x required).
2. Run `npm install` from the project root.
3. Run `npm run build` (should create `dist/klegar-portfolio/browser`).
4. Fix any compiler/template diagnostics reported on your machine before deploying.
5. Run `npm start`, test homepage and individual project URLs.
6. Create or reuse Supabase project, apply SQL schema, and allowlist only the correct admin Auth user.
7. Enter **public** Supabase project URL and publishable key into `src/environments.ts`.
8. Test RLS with an anonymous visitor: published content readable; drafts and writes denied.
9. Test RLS with a signed-in account not in `cms_admins`: dashboard and writes denied.
10. Test admin: sign-in, edit, save draft, preview, upload, publish, history, restore, JSON backup.
11. Verify CSS on 320px, 375px, 400px, 768px and desktops.
12. Push a feature branch and inspect the Vercel preview before merging the live branch.

## Known limitations
- No server-side rendering: dynamically published metadata is updated client-side.
- Image files cannot be deleted by the dashboard (by policy); clean up unused uploads carefully in Supabase Storage.
- Title-derived project slugs change when renamed.
- Preserves original color/theme tokens, sections and content, but some prior JavaScript-only special effects are replaced with Angular interactions rather than exact pixel/animation parity.
- Web contact form prepares a WhatsApp message; sending still requires the visitor to tap Send in WhatsApp.
