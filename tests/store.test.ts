import { beforeEach, describe, it, expect } from "vitest";
import { useOpsStore } from "@/store/useOpsStore";
import { createSeed } from "@/data/seed";
import {
  readiness,
  stageAge,
  weeklyBrief,
  workQueue,
} from "@/domain/OpsEngine";
import { localRepository } from "@/data/repository";
beforeEach(() => {
  localStorage.clear();
  useOpsStore.setState({
    data: createSeed(),
    cohortId: "winter",
    selection: null,
    filter: "all",
    stage: null,
    query: "",
    hydrated: false,
    storageNotice: "",
  });
});
describe("operational state transactions", () => {
  it("moves stages, resets clocks and appends a persistent audit event", () => {
    const s = useOpsStore.getState();
    s.moveApplicant("winter-a4", "Interview");
    const d = useOpsStore.getState().data;
    expect(d.applicants[4].stage).toBe("Interview");
    expect(stageAge(d.applicants[4], d.now)).toBe(0);
    expect(d.audit).toHaveLength(1);
    expect(localRepository.load().data.audit).toHaveLength(1);
  });
  it("completes a requirement and recomputes the brief", () => {
    const s = useOpsStore.getState(),
      before = weeklyBrief(s.data, "winter");
    s.completeRequirement("winter-p0", "identity");
    s.completeRequirement("winter-p0", "admin");
    const d = useOpsStore.getState().data;
    expect(readiness(d.participants[0])).toBe(60);
    expect(weeklyBrief(d, "winter").documents).toHaveLength(
      before.documents.length - 1,
    );
    expect(d.audit).toHaveLength(2);
  });
  it("requires explicit human confirmation for sensitive support closure", () => {
    const s = useOpsStore.getState();
    s.resolveSupport("winter-s0");
    expect(useOpsStore.getState().data.support[0].resolved).toBe(false);
    s.resolveSupport("winter-s0", true);
    expect(useOpsStore.getState().data.support[0].resolved).toBe(true);
    expect(
      weeklyBrief(useOpsStore.getState().data, "winter").decisions.some(
        (d) => d.id === "winter-s0",
      ),
    ).toBe(false);
  });
  it("resolves operational access requests without a sensitive-case confirmation", () => {
    useOpsStore.getState().resolveSupport("winter-s1");
    expect(useOpsStore.getState().data.support[1].resolved).toBe(true);
  });
  it("rejects conflicting rooms and applies a free room", () => {
    const s = useOpsStore.getState();
    s.moveRoom("winter-e1", "workshop");
    s.moveRoom("winter-e0", "workshop");
    expect(useOpsStore.getState().data.events[0].roomId).toBe("studio");
    expect(useOpsStore.getState().toast).toMatch(/already booked/);
    s.moveRoom("winter-e0", "seminar");
    expect(useOpsStore.getState().data.events[0].roomId).toBe("seminar");
  });
  it("keeps reminder drafts idempotent per record per demo day and preserves notes", () => {
    const s = useOpsStore.getState(),
      record = { kind: "participant" as const, id: "winter-p0" };
    s.queueReminder(record);
    s.queueReminder(record);
    s.addNote(record, "Confirm next step with coordinator.");
    expect(useOpsStore.getState().data.audit).toHaveLength(2);
    expect(useOpsStore.getState().data.audit[0].detail).toContain(
      "no message sent",
    );
    s.advanceTime();
    s.queueReminder(record);
    expect(
      useOpsStore.getState().data.audit.filter((a) => a.kind === "reminder"),
    ).toHaveLength(2);
  });
  it("clears cross-cohort record and filter context when switching", () => {
    const s = useOpsStore.getState();
    s.select({ kind: "participant", id: "winter-p0" });
    s.setFilter("documents");
    s.setQuery("Maya");
    s.setCohort("summer");
    expect(useOpsStore.getState()).toMatchObject({
      cohortId: "summer",
      selection: null,
      filter: "all",
      query: "",
    });
  });
  it("recovers malformed persisted data without crashing", () => {
    localStorage.setItem("scaleops.dataset.v1", JSON.stringify({ now: "bad" }));
    const loaded = localRepository.load();
    expect(loaded.notice).toMatch(/incompatible/);
    expect(loaded.data.cohorts).toHaveLength(3);
  });
  it("reset restores all cohorts and the operational clock", () => {
    const s = useOpsStore.getState();
    s.completeTask("winter-t0");
    s.advanceTime();
    s.reset();
    expect(useOpsStore.getState().data).toEqual(createSeed());
    expect(localRepository.load().data).toEqual(createSeed());
  });
  it("updates the participant coordinator in both document and onboarding queues", () => {
    const s = useOpsStore.getState();
    s.assignOwner("participant", "winter-p0", "Morgan Ellis");
    const queue = workQueue(useOpsStore.getState().data, "winter").filter(
      (q) => q.selection.id === "winter-p0",
    );
    expect(queue).toHaveLength(2);
    expect(queue.every((q) => q.owner === "Morgan Ellis")).toBe(true);
    s.completeRequirement("winter-p0", "identity");
    s.completeRequirement("winter-p0", "admin");
    const remaining = workQueue(useOpsStore.getState().data, "winter").filter(
      (q) => q.selection.id === "winter-p0",
    );
    expect(remaining).toHaveLength(1);
    expect(remaining[0].stage).toBe("Onboard");
  });
});
