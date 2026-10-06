# Deploying CohortOps on Vercel

The application is a standard Next.js app with locally bundled fonts and browser-local synthetic state. It requires no database, API key or environment secrets. No public deployment has yet been verified.

## Predetermined production settings

1. Sign in at <https://vercel.com/new> using your own account.
2. Under **Import Git Repository**, connect GitHub if prompted and import **Parthhhhhh30/lasr-scaleops**. Grant access to this repository if it is not listed.
3. Select **Next.js**, root directory **./**, production branch **main**, and Node.js **24.x**. Keep the detected build command **npm run build**, install command **npm ci** (set this override if needed), and default Next.js output directory. Add no environment variables.
4. Click **Deploy**. Open the resulting production URL. No custom domain is required.
5. Return only that public URL so production QA and the verified README link can be completed.

Do not enter real participant information. Each visitor receives the synthetic seed and stores subsequent edits in their own browser; hosting does not create shared programme storage.

## Verify the public deployment

From a checkout with dependencies and a Playwright-compatible Chromium installed:

```sh
PLAYWRIGHT_BASE_URL=https://your-actual-production-host.vercel.app npm run test:e2e
```

This runs the existing operational, responsive, persistence, keyboard and accessibility journeys against that URL, without starting a local server. Browser console errors and uncaught exceptions fail each journey. Each browser context has its own local state. Use the actual URL; do not commit a placeholder as the live demo.

After public QA passes, add the verified URL prominently to README and the demo guide, record the production verification in BUILD_STATUS, and commit/push that update. Local test success alone is not public-deployment evidence.
