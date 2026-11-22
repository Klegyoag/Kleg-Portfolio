# Klegar Portfolio Studio — Admin Setup

This adds a real, private content dashboard to the **existing static HTML/CSS/JavaScript portfolio**. Your GitHub repository continues to deploy through Vercel. Published content and media live in Supabase, so editing content will not require a Git commit or Vercel redeploy.

## What was built

- `/admin` or `/admin/`: modern, responsive, password-protected content studio.
- Editors for profile, portrait/CV, homepage hero, About, Services, interactive Skills, Journey, Projects, Contact/form options, design lab text, principles, footer, assistant questions/answers (including existing knowledge), and basic SEO fields.
- Add, edit, reorder and remove list cards; hide projects or feature them; image/PDF uploads (5 MB max).
- Save a **private draft**, open a **draft preview**, then **publish** the content to your visitors.
- Publication history with restore-to-draft, local JSON backup export/import.
- Supabase Auth sign-in, SQL row-level security (RLS), and an administrator allowlist. Visitors can see only the published row.
- Static site remains visible even before the CMS is configured or if Supabase cannot be reached.

## Step 1 — Create your Supabase project

Go to https://supabase.com/dashboard and create a project. Record the project's HTTPS URL, such as `https://abcdefghijk.supabase.co`, and the **publishable key** (`sb_publishable_...`) or older **anon/public key**.

> **Never put your Supabase secret key, service-role key, database password or API private keys in HTML, JavaScript or GitHub.** The public project URL and publishable/anon key are allowed in browser code because RLS enforces the actual access rules.

## Step 2 — Create tables and permissions

1. Open your Supabase project → **SQL Editor**.
2. Open [`supabase/001_portfolio_cms.sql`](supabase/001_portfolio_cms.sql) from this repository.
3. Paste and run that SQL in your own project.
4. It creates `cms_admins`, `cms_content`, `cms_revisions`, and the `portfolio-media` storage bucket with the appropriate access rules.

## Step 3 — Create the *only* administrator

1. Open **Authentication → Users** in your Supabase project.
2. Add a user **manually** with your chosen email and a unique strong password. Confirm the user if your Auth settings require confirmation. Do not enable public sign-up for this private dashboard.
3. Copy the real new **User UID** from the Supabase Users screen.
4. Go to SQL Editor and run the following, replacing the example with that **actual UID**:

```sql
insert into public.cms_admins (user_id)
values ('YOUR-REAL-AUTH-USER-UUID');
```

Only an Auth user whose UID is in `cms_admins` can read drafts, publish, upload, or view history. Logging in with another account is not enough.

## Step 4 — Connect the browser to Supabase

Open `cms-config.js` and set:

```js
window.CMS_CONFIG = Object.freeze({
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  publishableKey: 'YOUR_PUBLIC_PUBLISHABLE_OR_ANON_KEY'
});
```

The URL must be HTTPS and a `*.supabase.co` project URL. This simple static-site version keeps public configuration in `cms-config.js`, so Vercel environment variables alone will **not** inject it. No paid hosting plan or framework conversion is required for this structure.

## Step 5 — Deploy with your existing GitHub → Vercel workflow

The updated source files should replace/add files at the **root of your current portfolio repository**, preserving `index.html` in the root.

```powershell
# Example from the root of your portfolio repository
# Copy the edited files into the repository first, then:
git status
git add .
git commit -m "feat: add Supabase-powered portfolio admin studio"
git push origin main
```

If your Vercel project deploys another branch, push that branch instead. If it already deploys automatically from GitHub, Vercel should deploy the change after the push. Do not create a second Vercel project.

## Step 6 — Start editing

1. Open `https://kleg-portfolio.vercel.app/admin`.
2. Sign in with the manually created Supabase Auth user.
3. Open a section, change fields or add a project, and **Save draft**.
4. Click **Preview site** to view your unpublished content. You can switch between desktop and mobile frames.
5. Click **Publish changes** and confirm. Refresh the public homepage in a separate tab to see the changes.
6. For restoring an earlier version, use **Publication history → Restore to draft**, review, save, then publish.

### Initial content

The initial dashboard is prefilled with content extracted from the provided portfolio source. The original static website stays intact until you publish your first CMS version. Projects are not displayed until you add at least one visible project.

### Editing images

Inside the profile, projects or SEO sections, click **Upload image**. The dashboard stores images in Supabase Storage and inserts their public URL. The CV field accepts PDF uploads. Public URLs can also be pasted manually. Uploaded files are not removed automatically when a card is deleted; clean up unused media in Supabase Storage if needed.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Login says setup needed | Fill in and redeploy `cms-config.js`. |
| Wrong email or password | Verify the user exists in Supabase Authentication and has a password. |
| Account is not an administrator | Add the signed-in Auth user's exact UID to `public.cms_admins`. |
| RLS / 403 error on publish | Run the entire SQL setup in the project that matches `cms-config.js`. |
| Media upload denied | Verify `portfolio-media` exists and your account is allowlisted. |
| Preview works but live site unchanged | Save the draft, click **Publish changes**, and refresh the live site. |
| Site shows old content | Hard-refresh to update the service worker; inspect the browser console and Supabase project status. |
| `404` at `/admin` | Check that the `admin/` folder was committed and the updated `vercel.json` was deployed. |

## Important limitations

- This dashboard edits **supported content fields and list sections**. It does **not** edit arbitrary HTML/CSS source code, Vercel settings, or server behavior. Those still need code changes and a Git deployment.
- Search-engine preview metadata changed with browser-side JavaScript is **not reliable for all crawlers or social link preview bots**. For guaranteed server-rendered SEO updates, add an SSR/edge metadata layer later.
- No analytics collection is enabled; the counters show the number of content items rather than visitor traffic.
- Site content uses a **last-write-wins** draft row; if several admins edit simultaneously, they should coordinate to avoid overwriting each other. Intended as a one-admin portfolio studio.
- The CMS uses Supabase availability for content changes. The static portfolio remains readable if the CMS API is temporarily unavailable.
- A live working sign-in and publish cycle requires **your own Supabase project** and the setup steps above. This source ZIP does not contain credentials or remotely modify your existing GitHub/Vercel account.

## Official references

- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
