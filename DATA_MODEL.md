# Data model

All records are fictional. Email addresses use `example.com`. No real documents or private LASR information are stored.

| Entity | Fields / relationships | Purpose |
| --- | --- | --- |
| Cohort | ID, name, dates, launch, lifecycle stage, capacity, location | Operating context |
| Applicant | Cohort ID, identity, focus, stage, stage-entered timestamp, reviewer, complete/feedback flags | Coordination pipeline; no scores |
| Participant | Cohort ID, identity, focus, stage, coordinator owner, team, supervisor, arrival, requirements | Readiness register |
| Requirement | Participant-owned ID, label, document/onboarding/allocation class, complete flag | Explicit administrative checklist |
| Task | Cohort, optional participant ID, title, owner, due, priority, stage, complete | Owned operational action |
| SupportRequest | Cohort, participant ID, title, safe demonstration detail, category, owner, opened, resolved | Support history and escalation queue |
| Room | ID, name, capacity | Room assignment options |
| ScheduleEntry | Cohort, room ID, title, start/end, owner | Interval-overlap detection |
| Milestone | Cohort, title, due, stage | Upcoming programme deadlines |
| OperationalRisk | Cohort, title, detail, owner, priority, acknowledged, stage | Decisions requiring review |
| AuditEvent | Cohort, entity ID, time, action, actor, change/note/reminder class, detail | Changes and briefing sources |

`Dataset.now` is the shared demo clock. `Selection` identifies a contextual record by entity kind and ID. `WorkItem` is derived, never persisted; it contains the selection target, title, deterministic reason, owner, priority, lifecycle stage, category and human-escalation marker.

## Fixture structure

Winter: 24 active-pipeline applicants, 12 participants, a deliberate room overlap and several outstanding checklists. Summer: 18 applicants primarily in early review, 5 early participant records, no room overlap. Autumn: 12 applicants mostly at application, 2 early participant records, no room overlap. Team/supervisor names are embedded to avoid relational complexity without an assignment-editing workflow. Participant records include prior accepted cases outside the active applicant fixture; stage acceptance does not create a new participant.

No reviewer scoring, protected attributes, immigration eligibility, welfare case files or document contents exist in the schema. Administrative review is a completion flag set by the operator after human verification. Audit is browser-owned evidence of demonstration actions, not a tamper-proof institutional ledger.

## Persistence

A versioned key `scaleops.dataset.v1` stores the dataset. Zod validates required fields, enums and ISO timestamps at read. Invalid input uses a fresh seed plus a visible notice. Save failure retains current session state and warns that persistence is unavailable. Reset replaces all datasets and clears demo-generated notes/drafts/events. A later schema version should add an explicit migration before reuse of existing data.
