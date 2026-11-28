# Download CV update

Based on Kleg-Portfolio-CMS-Fixed.zip. The supplied CV is bundled unchanged as `src/assets/chris-klegar-yoag-cv.pdf`. The homepage now has a Download CV action beside its existing actions. Angular already copies src/assets into the production browser assets directory. A blank old CMS CV field falls back to this bundled PDF, without a database write. A valid custom URL remains authoritative. Admin → Profile & links → Profile media lets you upload a replacement PDF or hide the button; save and publish to apply changes. Hiding the button does not make the bundled asset private. Remove the bundled PDF before deployment if you do not want it publicly accessible. A remote PDF may open in a new tab instead of downloading depending on the host's headers.

The PDF contains personal contact and education information. Review the public version before pushing to a public repository or deploying. The document itself has not been rewritten. No live CMS or GitHub changes were made.

For the patch ZIP, extract its contents into the existing CMS-fixed repository root, replacing the listed files. For the complete ZIP, extract into a new folder. Then run `npm ci` if needed, `npm run build`, and `npm start`. Check Home and click Download CV. The full Angular build/browser test must be performed locally.

Regression test: see CMS-FIX.md. The test also covers old blank links, new blank links, custom URLs and the visibility toggle.
