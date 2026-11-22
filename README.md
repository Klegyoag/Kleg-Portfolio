# Chris Klegar Yoag — Developer Portfolio

A static HTML/CSS/JavaScript portfolio for Chris Klegar Yoag, Software & ASP.NET Core Developer and Founder of X10 THINK.

## Current build

- Home, About, Services, Skills, Journey, Design Lab and Contact sections
- Three interface themes
- Command palette and keyboard-friendly interactions
- Local portfolio assistant using predefined knowledge
- WhatsApp-first contact flow with client-side validation
- Responsive layout and reduced-motion support
- PWA manifest and service worker
- Social/SEO metadata that does not claim a placeholder production domain

## Optional content / future enhancements

- The project showcase is included, but hidden until you add a visible project through the admin dashboard.
- The CV download button is included, but hidden until you supply or upload a CV PDF.
- Server-rendered canonical/social metadata and a sitemap (a client-rendered CMS cannot guarantee social bot previews).

## Run locally

Use any local static server, for example:

```powershell
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Before production launch

1. Connect the final domain.
2. Add the real canonical URL and absolute Open Graph URL/image metadata.
3. Generate `sitemap.xml` using that real domain and add its URL to `robots.txt`.
4. Upload your final CV PDF through the admin dashboard when ready.

## New: Portfolio Studio CMS

The repository now includes the **`/admin`** content-management dashboard with editable content, drafts, preview, publishing, images and a version history. All updates are stored in **Supabase** under RLS. There are no admin credentials in the source code.

**Configuration:** Follow [`ADMIN-SETUP.md`](ADMIN-SETUP.md) before trying to log in or publish. The original static frontend still works without CMS setup.
