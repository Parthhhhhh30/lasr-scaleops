# Test plan

## Required quality gates

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`.

## Domain proof

`tests/engine.test.ts`: incomplete/past-due rules including exact boundary; stage elapsed time and strict >72h SLA; empty and complete checklists; document blockers; overlapping/contained/adjacent/different-room bookings; escalation categories; launch coordination dependencies; missing feedback; current-state and cohort-scoped brief derivation.

## State and repository proof

`tests/store.test.ts`: stage movement and clock reset; requirement action → readiness/brief; sensitive confirmation guard; ordinary support resolution; rejection of room overlap; draft idempotence; note/audit persistence; time shift; cohort context clearing; malformed storage recovery; complete reset.

## UI/integration proof

`tests/ui.test.tsx`: cohort switch, lifecycle filters, applicant search/inspector stage movement, participant completion and live readiness, support resolution and brief recomputation, Ctrl+K command execution and offer confirmation; live brief labels; complete filter clearing; direct board moves and confirmation; grouped demo controls; brief date after crossing a year boundary.

## Browser proof

Eleven Playwright production-server journeys:

1. Document check-in → 100% readiness → blocker removal → brief event → refresh persistence.
2. Room overlap resolution → access support closure → reviewer SLA command → stage reset and note → live brief.
3. Cohort change → board → sensitive-case cancellation → clock simulation → reset.
4. Mobile navigation → accessible command palette → brief → no document-width overflow.
5. Axe WCAG A/AA scans of all four workspaces, participant inspector and command menu; keyboard focus and Escape restoration.
6. Desktop split inspector → resized interactive workspace → selected records → Escape and queue scroll preservation.
7. Accessible board move → stage clock reset → Offer/Accepted confirmation → keyboard focus → audit and refresh persistence.
8. Live brief command → destination focus → audited demo advance → record command focus.
9. Tablet modal drawer → background isolation → reduced motion → accessibility and no width overflow.

10. Category/search/lifecycle filters → invalid room move rejected → owner reassignment → task completion and risk acknowledgement.
11. Reviewer/stage/name filters → batch Offer cancellation and confirmation → readiness filtering → support cross-navigation and human closure → current clipboard export and brief source link.

Every journey fails on uncaught browser exceptions or console errors via `e2e/fixtures.ts`. Set `PLAYWRIGHT_BASE_URL` to run the same journeys against a real public deployment without starting a local server; see [DEPLOYMENT.md](DEPLOYMENT.md).

Use the installed system Chromium where available; otherwise install a Playwright browser or set `PLAYWRIGHT_EXECUTABLE_PATH`. Each test has its own browser context/storage. Tests inspect user-visible outcomes and do not accept an empty or skipped suite as proof. Browser error console, screenshots, focus flow and automated accessibility scans complement the tests.

## Manual/recruiter walkthrough

Follow [DEMO_GUIDE.md](DEMO_GUIDE.md) for the exact 60–90 second route. Open Winter → search Maya → complete requirements → inspect support history → review weekly brief. Change cohort and verify counts. Try an overlapping room choice and confirm rejection. Queue a reminder twice and verify one draft. Review synthetic-data and AI/legal boundary copy. Check keyboard focus and Escape, tablet layout, mobile table scrolling and reduced motion.

## Remaining production validation

Firefox/WebKit, real assistive-technology evaluation, concurrent editing, permissions, sensitive-data access and real communications are outside this local prototype. Add these only alongside the corresponding production capability.

## Verified outcome

Final run in this cloud machine: lint, typecheck and build passed; all 29 Vitest tests and all 11 Playwright tests passed, none skipped. Axe detected no WCAG A/AA violations in the scanned surfaces. This is automated evidence, not a claim of complete accessibility certification.

Final visual review covered 35 surface/viewport combinations at widths 390–1440px, including every inspector kind, Admissions board/table, support, commands and demo controls. The five intentional screenshots are captured from a production server; the brief waits for the completion toast to disappear. Two representative journeys also passed in external-URL runner mode against the local production server. Public QA against https://lasr-scaleops.vercel.app/ was attempted on 6 October 2026. The test proxy rejects connections to that hostname before page load, so public results remain unverified until test-network access is enabled.
