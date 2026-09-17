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

## Intentionally not included yet

- Project showcase / project screenshots / case-study pages
- CV download
- Production canonical URL and sitemap (add these only after the real domain is known)

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
4. Add a CV later only when the final PDF is ready.
