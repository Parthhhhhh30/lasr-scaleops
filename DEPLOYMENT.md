# Deploying CohortOps on Vercel

The application is a standard Next.js app with locally bundled fonts and browser-local synthetic state. It requires no database, API key or environment secrets.

**Current production deployment:** https://lasr-scaleops.vercel.app/

Platform: Vercel. The project owner supplied this deployed URL. Public browser verification is outstanding because the testing environment rejects connections to this hostname before the application loads. This is a test-access blocker, not evidence of an application failure.

## Predetermined production settings

1. Sign in at <https://vercel.com/new> using your own account.
2. Under **Import Git Repository**, connect GitHub if prompted and import **Parthhhhhh30/lasr-scaleops**. Grant access to this repository if it is not listed.
3. Select **Next.js**, root directory **./**, production branch **main**, and Node.js **24.x**. Keep the detected build command **npm run build**, install command **npm ci** (set this override if needed), and default Next.js output directory. Add no environment variables.
4. Click **Deploy**. Open the resulting production URL. No custom domain is required.
5. Run the public QA command below before recording the replacement deployment as verified.

Do not enter real participant information. Each visitor receives the synthetic seed and stores subsequent edits in their own browser; hosting does not create shared programme storage.

## Verify the public deployment

From a checkout with dependencies and a Playwright-compatible Chromium installed:

```sh
PLAYWRIGHT_BASE_URL=https://lasr-scaleops.vercel.app npm run test:e2e
```

This runs the existing operational, responsive, persistence, keyboard and accessibility journeys against that URL, without starting a local server. Browser console errors and uncaught exceptions fail each journey. Each browser context has its own local state. Use the current production URL when repeating these checks.

After public QA passes, add the verified URL prominently to README and the demo guide, record the production verification in BUILD_STATUS, and commit/push that update. Local test success alone is not public-deployment evidence.
