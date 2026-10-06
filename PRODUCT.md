# Product model

## Mission
Help a small programme operations team maintain coordination quality as research cohorts grow. The unit of work is an exception with context, an accountable owner and a next step. The unit of navigation is the cohort.

This independent prototype demonstrates relevance to programme administration, application handling, participant support, visas/documents, logistics, communications and weekly reporting. It does not assert that LASR uses these workflows or thresholds.

## Work surfaces

| Surface | Operator question | Useful actions |
| --- | --- | --- |
| Cohort Control | What requires attention now? | Filter lifecycle/category, inspect a record, complete owned work, resolve booking overlap, acknowledge risk |
| Admissions Flow | Where are applications waiting? | Search, filter reviewer/stage, sort by age/name, switch board/table, select batches, move stage in the table/inspector or directly on a board ticket, record feedback |
| Participant Ops | Who is ready, and who needs support? | Filter checklist readiness, complete requirements, inspect allocations, handle support requests |
| Operations Brief | What should we cover in the check-in? | Trace problems to records, inspect recent changes, open/copy the live current memo |

## Behavioral commitments

Record mutations persist and recompute derived views immediately. Stage movement resets the clock. Requirement completion removes corresponding missing-information flags. Support closure changes queue and brief and remains in participant history. Room movement recalculates overlap. Cohort switching clears stale filters and selections. The demo clock advances globally so every cohort shares a consistent temporal reference.

Offer and acceptance changes record reviewer decisions; they do not decide admission. Checklist-ready is distinct from launch coordination readiness. A risk acknowledgement records human review rather than asserting the risk has disappeared.

## Scope choices

V1 includes three cohorts, stage board/table, responsive split-view inspector, local persistence, audit notes, reminder drafts and sensitive-case confirmation. Its state remains browser-local even when the application is hosted; it avoids generative model calls and charts that do not support a decision. Participant creation from acceptance, dynamic room capacity checking, drag-and-drop booking, alumni management and communications delivery are future extensions. The lifecycle controls the queue; later stages have useful empty states rather than invented activity.

## Success criteria

A reviewer can demonstrate a complete action → derived result → audit trail journey in a few minutes. Owners and deterministic reasons are visible. The prototype is explainable without infrastructure expertise. No secrets or external accounts are needed to run it.

## Focused interaction refinement

The display name is CohortOps, an independent prototype with no LASR/Arcadia affiliation. Cohort Control opens with a cohesive compact status rail, not a grid of metrics. A selected record stays connected to a 440px desktop inspector through a quiet background and border indicator; the workspace remains interactive. Below 1280px a modal drawer avoids squeezed working surfaces.

The Current Operations Brief is always derived from current state, with source transparency and copy export. There is no pretend generation action. Demo controls group the synthetic clock, audited three-day advance and confirmed reset apart from normal programme work. Board selectors enable direct keyboard-accessible coordination stage moves; Offer and Accepted still record an already-made human decision. Rules, synthetic data, persistence and audit remain unchanged.
