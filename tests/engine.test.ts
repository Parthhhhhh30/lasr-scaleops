import { describe, it, expect } from "vitest";
import { createSeed } from "@/data/seed";
import {
  cohortMetrics,
  documentBlockers,
  hoursBetween,
  needsHuman,
  overdue,
  readiness,
  roomConflicts,
  slaBreached,
  stageAge,
  weeklyBrief,
  workQueue,
} from "@/domain/OpsEngine";
import type { ScheduleEntry } from "@/domain/types";
describe("deterministic operations rules", () => {
  it("flags only incomplete tasks strictly after their due time", () => {
    const d = createSeed(),
      t = d.tasks[0];
    expect(overdue(t, d.now)).toBe(true);
    expect(overdue({ ...t, complete: true }, d.now)).toBe(false);
    expect(overdue({ ...t, due: d.now }, d.now)).toBe(false);
  });
  it("computes stage ageing and exact 72-hour threshold without flagging accepted applicants", () => {
    const d = createSeed(),
      a = {
        ...d.applicants[4],
        stageEntered: new Date(Date.parse(d.now) - 72 * 3600000).toISOString(),
      };
    expect(stageAge(a, d.now)).toBe(72);
    expect(slaBreached(a, d.now)).toBe(false);
    expect(slaBreached(a, new Date(Date.parse(d.now) + 1).toISOString())).toBe(
      true,
    );
    expect(
      slaBreached(
        { ...a, stage: "Accepted" },
        new Date(Date.parse(d.now) + 86400000).toISOString(),
      ),
    ).toBe(false);
    expect(hoursBetween(d.now, a.stageEntered)).toBe(0);
  });
  it("readiness uses the actual checklist denominator and documents remain independent", () => {
    const p = createSeed().participants[0];
    expect(readiness(p)).toBe(20);
    expect(documentBlockers(p)).toHaveLength(2);
    expect(
      readiness({
        ...p,
        requirements: p.requirements.map((r) => ({ ...r, complete: true })),
      }),
    ).toBe(100);
    expect(readiness({ ...p, requirements: [] })).toBe(0);
  });
  it("detects overlaps once, supports contained intervals and permits adjacent bookings", () => {
    const e = createSeed().events.filter((e) => e.cohortId === "winter");
    expect(roomConflicts(e)).toHaveLength(1);
    const base = e[0];
    const interval = (
      id: string,
      start: string,
      end: string,
      roomId = base.roomId,
    ): ScheduleEntry => ({ ...base, id, start, end, roomId });
    expect(
      roomConflicts([
        base,
        interval("contained", "2027-01-25T10:30:00Z", "2027-01-25T11:00:00Z"),
      ]),
    ).toHaveLength(1);
    expect(
      roomConflicts([
        base,
        interval("adjacent", base.end, "2027-01-25T14:00:00Z"),
      ]),
    ).toHaveLength(0);
    expect(
      roomConflicts([base, interval("other", base.start, base.end, "seminar")]),
    ).toHaveLength(0);
  });
  it("routes welfare, legal and complaints to humans; access and logistics remain operational", () => {
    expect(needsHuman("visa")).toBe(true);
    expect(needsHuman("welfare")).toBe(true);
    expect(needsHuman("complaint")).toBe(true);
    expect(needsHuman("access")).toBe(false);
    expect(needsHuman("logistics")).toBe(false);
  });
  it("requires support, tasks and rooms as well as checklists for launch readiness", () => {
    const d = createSeed();
    d.participants = d.participants.map((p) => ({
      ...p,
      requirements: p.requirements.map((r) => ({ ...r, complete: true })),
    }));
    expect(cohortMetrics(d, "winter").launchReady).toBe(false);
    d.support.forEach((s) => (s.resolved = true));
    d.tasks.forEach((t) => (t.complete = true));
    d.events[1].roomId = "seminar";
    expect(cohortMetrics(d, "winter").launchReady).toBe(true);
    expect(cohortMetrics(d, "missing").launchReady).toBe(false);
  });
  it("queues missing feedback and incomplete applications even before an SLA breach", () => {
    const d = createSeed();
    const q = workQueue(d, "winter");
    expect(
      q.some((q) => q.detail === "Application information incomplete"),
    ).toBe(true);
    expect(q.some((q) => q.detail === "Reviewer feedback outstanding")).toBe(
      true,
    );
    expect(q.filter((q) => q.category === "logistics")).toHaveLength(1);
  });
  it("derives briefs from the selected cohort, clock and current records", () => {
    const d = createSeed(),
      before = weeklyBrief(d, "winter");
    d.participants[0].requirements.forEach((r) => (r.complete = true));
    d.support[0].resolved = true;
    d.events[1].roomId = "seminar";
    const after = weeklyBrief(d, "winter");
    expect(after.documents.length).toBe(before.documents.length - 1);
    expect(after.metrics.ready).toBe(before.metrics.ready + 1);
    expect(after.metrics.unresolvedSupport.length).toBe(
      before.metrics.unresolvedSupport.length - 1,
    );
    expect(after.metrics.conflicts).toHaveLength(0);
    expect(after.upcoming.map((m) => m.title)).toEqual(["Document check-in"]);
    expect(weeklyBrief(d, "summer").metrics.participants).toHaveLength(5);
  });
});
