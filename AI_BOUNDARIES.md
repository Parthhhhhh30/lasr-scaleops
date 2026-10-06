# AI and automation boundaries

## Implemented today

There is **no generative model integration**. The weekly brief is assembled from deterministic current-state selectors. Reminder drafts are fixed templates stored in audit history for human review; nothing is delivered. Labels explain both facts. An interview explanation should not attribute these functions to AI.

## Behavior classes

| Internal class | Appropriate behavior | V1 example |
| --- | --- | --- |
| ACT | Safe, deterministic, reversible coordination | Missing-item detection, stage SLA flags, conflict detection, overdue queues |
| ASSIST | Prepare work for a responsible human | Fixed reminder draft and compiled weekly brief; neither uses AI today |
| ESCALATE | Route sensitive or ambiguous work to human judgement | Visa/legal queries, welfare, complaints, admissions decisions, exceptions |

These classes guide design and are not repeated as decorative labels across the interface.

## Hard boundaries

Never decide admission, secretly rank candidates, infer protected attributes, determine immigration eligibility, provide legal advice, fabricate missing facts, autonomously close welfare/complaint cases, or overwrite deterministic records with model output. Record offer/acceptance only after reviewer confirmation. Closing sensitive support requires confirmation of human follow-up. Document receipt and coordinator review never imply visa eligibility.

## If AI assistance is added later

Summarisation, drafting, explicit-category suggestions and action extraction can help reduce repetitive coordination. Keep source references, record model/version, display proposed versus accepted text, redact unnecessary personal information and require review before delivery or state mutation. Unknown facts must remain unknown. Selection scores and sensitive personal inferences do not belong in the system. Use role-limited access and deletion/retention policies before processing real participant conversations.

The prototype uses fictional safe support details. Do not enter real sensitive circumstances into browser local storage. Production escalation needs named trained staff, a private channel, access controls and documented handling procedures rather than a confirmation modal alone.
