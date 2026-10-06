# Test plan

## Required quality gates

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`.

## Domain proof

`tests/engine.test.ts`: incomplete/past-due rules including exact boundary; stage elapsed time and strict >72h SLA; empty and complete checklists; document blockers; overlapping/contained/adjacent/different-room bookings; escalation categories; launch coordination dependencies; missing feedback; current-state and cohort-scoped brief derivation.

## State and repository proof

`tests/store.test.ts`: stage movement and clock reset; requirement action → readiness/brief; sensitive confirmation guard; ordinary support resolution; rejection of room overlap; draft idempotence; note/audit persistence; time shift; cohort context clearing; malformed storage recovery; complete reset.

## UI/integration proof

`tests/ui.test.tsx`: cohort switch, lifecycle filters, applicant search/inspector stage movement, participant completion and live readiness, support resolution and brief recomputation, Ctrl+K command execution and offer confirmation.

## Browser proof

Four operational Playwright production-server journeys plus one accessibility/focus journey:

1. Document check-in → 100% readiness → blocker removal → brief event → refresh persistence.
2. Room overlap resolution → access support closure → reviewer SLA command → stage reset and note → live brief.
3. Cohort change → board → sensitive-case cancellation → clock simulation → reset.
4. Mobile navigation → accessible command palette → brief → no document-width overflow.
5. Axe WCAG A/AA scans of all four workspaces, participant inspector and command menu; keyboard focus and Escape restoration.

Use the installed system Chromium where available; otherwise install a Playwright browser or set `PLAYWRIGHT_EXECUTABLE_PATH`. Each test has its own browser context/storage. Tests inspect user-visible outcomes and do not accept an empty or skipped suite as proof. Browser error console, screenshots, focus flow and automated accessibility scans complement the tests.

## Manual/recruiter walkthrough

Open Winter → search Maya → complete requirements → inspect support history → review weekly brief. Change cohort and verify counts. Try an overlapping room choice and confirm rejection. Queue a reminder twice and verify one draft. Review synthetic-data and AI/legal boundary copy. Check keyboard focus and Escape, tablet layout, mobile table scrolling and reduced motion.

## Remaining production validation

Firefox/WebKit, real assistive-technology evaluation, concurrent editing, permissions, sensitive-data access and real communications are outside this local prototype. Add these only alongside the corresponding production capability.

## Verified outcome

Final run in this cloud machine: lint, typecheck and build passed; all 24 Vitest tests and all 5 Playwright tests passed, none skipped. Axe detected no WCAG A/AA violations in the scanned surfaces. This is automated evidence, not a claim of complete accessibility certification.
