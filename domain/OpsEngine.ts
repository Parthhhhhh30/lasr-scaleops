import {
  type Applicant,
  type Dataset,
  type Lifecycle,
  type Participant,
  type ScheduleEntry,
  type SupportCategory,
  type Task,
  type WorkItem,
} from "./types";
export const RULES = {
  reviewerSlaHours: 72,
  supportSlaHours: 48,
  upcomingDays: 7,
  readinessTarget: 100,
} as const;
export const hoursBetween = (earlier: string, now: string) =>
  Math.max(0, (Date.parse(now) - Date.parse(earlier)) / 3600000);
export const stageAge = (a: Applicant, now: string) =>
  Math.floor(hoursBetween(a.stageEntered, now));
export const slaBreached = (a: Applicant, now: string) =>
  ["Initial screen", "Assessment", "Interview"].includes(a.stage) &&
  hoursBetween(a.stageEntered, now) > RULES.reviewerSlaHours;
export const overdue = (task: Task, now: string) =>
  !task.complete && Date.parse(task.due) < Date.parse(now);
export const readiness = (p: Participant) =>
  p.requirements.length
    ? Math.round(
        (p.requirements.filter((r) => r.complete).length /
          p.requirements.length) *
          100,
      )
    : 0;
export const documentBlockers = (p: Participant) =>
  p.requirements.filter((r) => r.kind === "document" && !r.complete);
export const needsHuman = (category: SupportCategory) =>
  ["visa", "welfare", "complaint"].includes(category);
export function roomConflicts(events: ScheduleEntry[]) {
  const conflicts: { a: ScheduleEntry; b: ScheduleEntry }[] = [];
  events.forEach((a, i) =>
    events.slice(i + 1).forEach((b) => {
      if (
        a.roomId === b.roomId &&
        Date.parse(a.start) < Date.parse(b.end) &&
        Date.parse(b.start) < Date.parse(a.end)
      )
        conflicts.push({ a, b });
    }),
  );
  return conflicts;
}
export const applicantLifecycle = (a: Applicant): Lifecycle =>
  a.stage === "Application"
    ? "Recruit"
    : a.stage === "Offer" || a.stage === "Accepted"
      ? "Offer"
      : "Screen";
export function cohortMetrics(d: Dataset, cohortId: string) {
  const participants = d.participants.filter((p) => p.cohortId === cohortId);
  const conflicts = roomConflicts(
    d.events.filter((e) => e.cohortId === cohortId),
  );
  const unresolvedSupport = d.support.filter(
    (s) => s.cohortId === cohortId && !s.resolved,
  );
  const overdueTasks = d.tasks.filter(
    (t) => t.cohortId === cohortId && overdue(t, d.now),
  );
  const ready = participants.filter(
    (p) => readiness(p) === RULES.readinessTarget,
  ).length;
  return {
    participants,
    ready,
    readiness: participants.length
      ? Math.round(
          participants.reduce((s, p) => s + readiness(p), 0) /
            participants.length,
        )
      : 0,
    conflicts,
    unresolvedSupport,
    overdueTasks,
    launchReady:
      participants.length > 0 &&
      ready === participants.length &&
      conflicts.length === 0 &&
      unresolvedSupport.length === 0 &&
      overdueTasks.length === 0,
  };
}
export function workQueue(d: Dataset, cohortId: string): WorkItem[] {
  const items: WorkItem[] = [];
  d.participants
    .filter((p) => p.cohortId === cohortId)
    .forEach((p) => {
      const missing = documentBlockers(p);
      if (missing.length)
        items.push({
          id: `doc-${p.id}`,
          selection: { kind: "participant", id: p.id },
          title: `${p.name} · document check-in`,
          detail: `${missing.length} administrative item${missing.length > 1 ? "s" : ""} outstanding`,
          owner: p.owner,
          priority: "high",
          stage: "Visa",
          category: "documents",
          escalation: false,
        });
      const onboarding = p.requirements.filter(
        (r) => r.kind !== "document" && !r.complete,
      );
      if (onboarding.length)
        items.push({
          id: `onboard-${p.id}`,
          selection: { kind: "participant", id: p.id },
          title: `${p.name} · onboarding check-in`,
          detail: `${onboarding.length} checklist item${onboarding.length === 1 ? "" : "s"} outstanding`,
          owner: p.owner,
          priority: "medium",
          stage: "Onboard",
          category: "tasks",
          escalation: false,
        });
    });
  d.applicants
    .filter((a) => a.cohortId === cohortId && a.stage !== "Accepted")
    .forEach((a) => {
      if (
        slaBreached(a, d.now) ||
        !a.complete ||
        (!a.feedback &&
          ["Initial screen", "Assessment", "Interview"].includes(a.stage))
      )
        items.push({
          id: `app-${a.id}`,
          selection: { kind: "applicant", id: a.id },
          title: a.name,
          detail: !a.complete
            ? "Application information incomplete"
            : !a.feedback
              ? "Reviewer feedback outstanding"
              : `${stageAge(a, d.now)}h in ${a.stage.toLowerCase()}`,
          owner: a.owner,
          priority: slaBreached(a, d.now) ? "high" : "medium",
          stage: applicantLifecycle(a),
          category: "admissions",
          escalation: false,
        });
    });
  d.tasks
    .filter((t) => t.cohortId === cohortId && !t.complete)
    .forEach((t) =>
      items.push({
        id: t.id,
        selection: { kind: "task", id: t.id },
        title: t.title,
        detail: overdue(t, d.now)
          ? "Overdue · follow up with owner"
          : "Owned action",
        owner: t.owner,
        priority: overdue(t, d.now) ? "high" : t.priority,
        stage: t.stage,
        category: "tasks",
        due: t.due,
        escalation: false,
      }),
    );
  d.support
    .filter((s) => s.cohortId === cohortId && !s.resolved)
    .forEach((s) =>
      items.push({
        id: s.id,
        selection: { kind: "support", id: s.id },
        title: s.title,
        detail: needsHuman(s.category)
          ? "Human handling required"
          : `${Math.floor(hoursBetween(s.opened, d.now))}h open · ${hoursBetween(s.opened, d.now) > RULES.supportSlaHours ? "response overdue" : "awaiting response"}`,
        owner: s.owner,
        priority:
          needsHuman(s.category) ||
          hoursBetween(s.opened, d.now) > RULES.supportSlaHours
            ? "high"
            : "medium",
        stage: "Onboard",
        category: "support",
        escalation: needsHuman(s.category),
      }),
    );
  roomConflicts(d.events.filter((e) => e.cohortId === cohortId)).forEach(
    ({ a, b }) =>
      items.push({
        id: `conflict-${a.id}-${b.id}`,
        selection: { kind: "event", id: a.id },
        title: "Room booking overlap",
        detail: `${a.title} / ${b.title}`,
        owner: a.owner,
        priority: "high",
        stage: "Launch",
        category: "logistics",
        escalation: false,
      }),
  );
  d.risks
    .filter((r) => r.cohortId === cohortId && !r.acknowledged)
    .forEach((r) =>
      items.push({
        id: r.id,
        selection: { kind: "risk", id: r.id },
        title: r.title,
        detail: "Decision required · acknowledge after review",
        owner: r.owner,
        priority: r.priority,
        stage: r.stage,
        category: "risk",
        escalation: true,
      }),
    );
  return items.sort(
    (a, b) =>
      ({ high: 0, medium: 1, low: 2 })[a.priority] -
        { high: 0, medium: 1, low: 2 }[b.priority] ||
      a.title.localeCompare(b.title),
  );
}
export function weeklyBrief(d: Dataset, cohortId: string) {
  const metrics = cohortMetrics(d, cohortId),
    queue = workQueue(d, cohortId);
  const breaches = d.applicants.filter(
    (a) => a.cohortId === cohortId && slaBreached(a, d.now),
  );
  const upcoming = d.milestones.filter(
    (m) =>
      m.cohortId === cohortId &&
      Date.parse(m.due) >= Date.parse(d.now) &&
      Date.parse(m.due) <= Date.parse(d.now) + RULES.upcomingDays * 86400000,
  );
  const recent = d.audit
    .filter(
      (a) => a.cohortId === cohortId && hoursBetween(a.at, d.now) <= 7 * 24,
    )
    .slice()
    .reverse();
  return {
    metrics,
    queue,
    breaches,
    upcoming,
    recent,
    decisions: queue.filter((q) => q.escalation),
    documents: metrics.participants.filter(
      (p) => documentBlockers(p).length > 0,
    ),
    summary: `${metrics.ready} of ${metrics.participants.length} participants are checklist-ready. ${metrics.overdueTasks.length} action${metrics.overdueTasks.length === 1 ? " is" : "s are"} overdue, ${breaches.length} applications exceed the ${RULES.reviewerSlaHours}-hour review window, and ${metrics.conflicts.length} room conflict${metrics.conflicts.length === 1 ? " requires" : "s require"} coordination.`,
  };
}
export const OpsEngine = {
  stageAge,
  slaBreached,
  overdue,
  readiness,
  documentBlockers,
  needsHuman,
  roomConflicts,
  cohortMetrics,
  workQueue,
  weeklyBrief,
};
