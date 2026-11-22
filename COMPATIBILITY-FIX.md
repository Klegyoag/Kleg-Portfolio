# Angular 22 dependency compatibility fix

Original package.json used TypeScript ~5.9.2, which Angular 22 cannot install.
Corrected TypeScript to ~6.0.3 (Angular 22 supports >=6.0.0 <6.1.0).
Corrected Node engine requirements to ^22.22.3 || ^24.15.0 || >=26.0.0.

## Windows Command Prompt

1. From the project root (`package.json` located here), replace package.json with the fixed file from this ZIP.
2. Run `node -v` to verify Node.js compatibility. Upgrade Node if necessary.
3. Run `npm install`, then `npm run build`, then `npm start`.

Do not use `--force` or `--legacy-peer-deps` to bypass incompatible peer dependencies.

Note: This change addresses the reported dependency-resolution error. A production build could not be executed in this environment because access to the npm registry was unavailable. Further compiler diagnostics, if any, must be addressed when dependencies are installed.
