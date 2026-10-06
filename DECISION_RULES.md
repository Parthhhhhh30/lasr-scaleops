# Decision rules

These are **explicit demonstration policies, not LASR policies**. Implementation: `domain/OpsEngine.ts`. Thresholds: `RULES`.

| Rule | Exact behavior | Boundary |
| --- | --- | --- |
| Stage age | Nonnegative elapsed hours since stage entry; display rounds down | Future timestamps display zero |
| Reviewer SLA | Initial screen / Assessment / Interview with elapsed time strictly greater than 72h | Exactly 72h is not a breach; accepted records are excluded |
| Missing feedback | Flag review-stage applicants whose feedback flag is false | Does not assess candidate quality |
| Incomplete application | Flag application information marked incomplete before acceptance | Accepted records excluded from applicant attention queue |
| Task overdue | Incomplete task with due timestamp strictly before demo now | Exactly due now is not overdue |
| Checklist readiness | Rounded completed item count / total item count × 100 | Empty checklist returns 0, not ready |
| Document blocker | Any incomplete item with class `document` | Information tracking only; no legal eligibility |
| Room conflict | Same room and strictly overlapping intervals | Adjacent end/start is allowed; pair listed once |
| Sensitive support | Visa, welfare and complaint categories require human handling | Access/logistics are operational; category is explicit, never inferred |
| Support response | Unresolved request older than 48h gets response-overdue copy | Visa/welfare matters remain human regardless of age |
| Launch coordination | At least one participant, all checklists complete, zero room conflicts, zero unresolved support, zero overdue tasks | Risk acknowledgement and checklist status are not proofs of legal or safety clearance |
| Deadline window | Milestones from now through seven days inclusive | Past milestones appear in the lifecycle list with a past-due label |
| Weekly changes | Selected-cohort audit events within previous seven days | Counts and current problems recompute from records |

The queue orders high → medium → low, then title. Documents, breached review SLAs, overdue tasks, sensitive/late support and room overlaps are high; missing feedback/completeness and ordinary owned actions retain defined priorities. Risk review is shown as a decision requirement. Human review does not imply that AI has made a determination.

A room mutation is rejected when it introduces overlap for that event. Capacity is displayed for operator judgement; no attendee count is invented. Reminder drafts are idempotent per entity per demo date. Assignment, notes, completion, stage movement, room movement, support resolution, risk acknowledgement and time shift append an audit event.

Changing stage resets its clock and clears feedback for the new stage. Entering Offer or Accepted in the UI confirms the reviewer made the decision. Reopening a checklist item or task is supported. Resolved support remains visible in history. Acknowledged risks leave the unacknowledged-decision queue but remain in the underlying dataset and audit history.
