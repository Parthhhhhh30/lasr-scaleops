# CohortOps: 60–90 second recruiter walkthrough

**Production demo:** https://lasr-scaleops.vercel.app/

The route is verified against the repository’s synthetic seed. Independent verification of the deployed host awaits test-network access.

Use a desktop window at least 1280px wide. Start from Winter ’27 in Cohort Control. If you have already explored, open **Demo controls → Reset demo state → Reset demo data** first. All names and policies are fictional. Changes persist in this browser only.

| Time | Exact action | Suggested explanation and visible result |
| --- | --- | --- |
| 0–10s | Stay in Cohort Control; point to the queue, owner and priority columns. | “I designed this around programme coordination handoffs. The starting point is what needs attention and who owns it, rather than headline metrics.” |
| 10–30s | Search the attention queue for **Maya**. Open **Maya Chen · document check-in**. Check **Identity document received**, **Visa/admin information reviewed by coordinator**, **Workspace access confirmed**, and **Orientation attendance confirmed**. | “These flags record checks already performed by a human. Maya moves from 20% to 100% checklist readiness; the document exception disappears while the desktop workspace remains usable.” |
| 30–40s | Close the inspector; clear the search. | “The document queue has changed immediately. The cohort now has five checklist-ready participants instead of four. Checklist-ready does not mean legally eligible.” |
| 40–60s | Open **Admissions Flow**. Search **Amara**. Open her record and change **Application stage → Offer**. Read the confirmation, then choose **Cancel**. Change the stage to **Interview** instead. | “Amara was waiting beyond the demo review window. Moving her to Interview resets the stage clock. Offer and acceptance require confirmation that a reviewer already made the decision; the application never scores or selects candidates.” |
| 60–75s | Close the inspector. Open **Operations Brief**; scroll to **Changes this week**. | “This is live deterministic reporting: the checklist changes and Amara’s stage move are already in the audit history. There is no pretend AI generation step.” |
| 75–90s | Press **Ctrl+K / ⌘K**, type **Maya**, show the matching record, then press **Escape**. | “Records and actions are reachable from the keyboard. The principle is deterministic automation where safe, human judgement where sensitive.” |

The remaining owned task to confirm Maya’s arrival is separate from her checklist and may still appear. Do not imply that completing documents closes every related action.

## What not to overclaim

- This is an independent prototype inspired by the LASR Programme Operations Associate role, not a LASR deployment, internal process or endorsement.
- The 72-hour review window is a demonstration policy. No business savings or programme outcomes have been measured.
- No generative model runs in the application. Reminder drafts are fixed templates and remain unsent.
- Browser-local persistence and editable audit records demonstrate workflows; they are not institutional security or a multi-user backend.
- The implementation used Codex-assisted development. Discuss the operating requirements, safeguards, product decisions and validation honestly.

For a longer walkthrough, resolve **Room booking overlap** by choosing **Seminar room**, then inspect its changed brief and audit entry. See [README.md](README.md) for further interactions and [APPLICATION_COPY.md](APPLICATION_COPY.md) for application wording.
