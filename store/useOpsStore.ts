import { create } from "zustand";
import { createSeed } from "@/data/seed";
import { localRepository } from "@/data/repository";
import {
  APPLICATION_STAGES,
  type ApplicationStage,
  type Dataset,
  type EntityKind,
  type Lifecycle,
  type Selection,
} from "@/domain/types";
import { roomConflicts } from "@/domain/OpsEngine";
export type View = "control" | "admissions" | "participants" | "brief";
export type Filter =
  "all" | "documents" | "admissions" | "support" | "logistics" | "overdue";
interface OpsStore {
  data: Dataset;
  cohortId: string;
  view: View;
  stage: Lifecycle | null;
  filter: Filter;
  query: string;
  filterResetVersion: number;
  selection: Selection | null;
  hydrated: boolean;
  toast: string;
  storageNotice: string;
  hydrate: () => void;
  setCohort: (id: string) => void;
  setView: (view: View) => void;
  setStage: (stage: Lifecycle | null) => void;
  setFilter: (filter: Filter) => void;
  setQuery: (query: string) => void;
  select: (selection: Selection | null) => void;
  clearFilters: () => void;
  completeRequirement: (participantId: string, requirementId: string) => void;
  moveApplicant: (id: string, stage: ApplicationStage) => void;
  updateApplicant: (
    id: string,
    field: "complete" | "feedback",
    value: boolean,
  ) => void;
  completeTask: (id: string) => void;
  resolveSupport: (id: string, confirmed?: boolean) => void;
  acknowledgeRisk: (id: string) => void;
  moveRoom: (id: string, roomId: string) => void;
  assignOwner: (kind: EntityKind, id: string, owner: string) => void;
  addNote: (selection: Selection, text: string) => void;
  queueReminder: (selection: Selection) => void;
  advanceTime: () => void;
  reset: () => void;
  dismissToast: () => void;
}
export const useOpsStore = create<OpsStore>((set, get) => {
  const change = (
    entityId: string,
    action: string,
    mutate: (d: Dataset) => void,
    kind: "change" | "note" | "reminder" = "change",
    detail = "",
  ) => {
    const d = structuredClone(get().data);
    mutate(d);
    d.audit.push({
      id: crypto.randomUUID(),
      cohortId: get().cohortId,
      entityId,
      at: d.now,
      action,
      actor: "Demo operator",
      kind,
      detail,
    });
    const saved = localRepository.save(d);
    set({
      data: d,
      toast: action,
      storageNotice: saved
        ? get().storageNotice
        : "Storage unavailable. Changes are retained only in this session.",
    });
  };
  return {
    data: createSeed(),
    cohortId: "winter",
    view: "control",
    stage: null,
    filter: "all",
    query: "",
    filterResetVersion: 0,
    selection: null,
    hydrated: false,
    toast: "",
    storageNotice: "",
    hydrate() {
      if (get().hydrated) return;
      const loaded = localRepository.load();
      set({
        data: loaded.data,
        hydrated: true,
        storageNotice: loaded.notice ?? "",
      });
    },
    setCohort(id) {
      if (!get().data.cohorts.some((c) => c.id === id)) return;
      set({
        cohortId: id,
        stage: null,
        filter: "all",
        query: "",
        selection: null,
        toast: "Cohort context updated",
      });
    },
    setView(view) {
      set({ view, stage: null, filter: "all", query: "", selection: null });
    },
    setStage(stage) {
      set({ stage });
    },
    setFilter(filter) {
      set({ filter, stage: null });
    },
    setQuery(query) {
      set({ query });
    },
    select(selection) {
      set({ selection });
    },
    clearFilters() {
      set({
        filter: "all",
        stage: null,
        query: "",
        filterResetVersion: get().filterResetVersion + 1,
      });
    },
    completeRequirement(pid, rid) {
      const p = get().data.participants.find((p) => p.id === pid),
        r = p?.requirements.find((r) => r.id === rid);
      if (!r) return;
      change(
        pid,
        `${r.label} ${r.complete ? "reopened" : "completed"}`,
        (d) => {
          const r = d.participants
            .find((p) => p.id === pid)!
            .requirements.find((r) => r.id === rid)!;
          r.complete = !r.complete;
        },
      );
    },
    moveApplicant(id, stage) {
      const a = get().data.applicants.find((a) => a.id === id);
      if (!a || a.stage === stage || !APPLICATION_STAGES.includes(stage))
        return;
      change(id, `${a.name} moved to ${stage}`, (d) => {
        const a = d.applicants.find((a) => a.id === id)!;
        a.stage = stage;
        a.stageEntered = d.now;
        a.feedback = false;
      });
    },
    updateApplicant(id, field, value) {
      if (!get().data.applicants.some((a) => a.id === id)) return;
      change(
        id,
        field === "feedback"
          ? "Reviewer feedback recorded"
          : "Application completeness updated",
        (d) => {
          d.applicants.find((a) => a.id === id)![field] = value;
        },
      );
    },
    completeTask(id) {
      if (!get().data.tasks.some((t) => t.id === id)) return;
      change(id, "Task status updated", (d) => {
        const t = d.tasks.find((t) => t.id === id)!;
        t.complete = !t.complete;
      });
    },
    resolveSupport(id, confirmed = false) {
      const s = get().data.support.find((s) => s.id === id);
      if (!s || s.resolved) return;
      if (["visa", "welfare", "complaint"].includes(s.category) && !confirmed) {
        set({
          toast: "Confirm human follow-up before closing a sensitive request.",
        });
        return;
      }
      change(id, "Support request resolved after operator review", (d) => {
        d.support.find((s) => s.id === id)!.resolved = true;
      });
    },
    acknowledgeRisk(id) {
      if (!get().data.risks.some((r) => r.id === id)) return;
      change(id, "Risk reviewed and acknowledged", (d) => {
        d.risks.find((r) => r.id === id)!.acknowledged = true;
      });
    },
    moveRoom(id, roomId) {
      const event = get().data.events.find((e) => e.id === id);
      if (!event || event.roomId === roomId) return;
      const proposed = get().data.events.map((e) =>
        e.id === id ? { ...e, roomId } : e,
      );
      if (
        roomConflicts(
          proposed.filter((e) => e.cohortId === event.cohortId),
        ).some((c) => c.a.id === id || c.b.id === id)
      ) {
        set({
          toast:
            "This room is already booked during that time. Choose another room.",
        });
        return;
      }
      change(id, "Room booking updated", (d) => {
        d.events.find((e) => e.id === id)!.roomId = roomId;
      });
    },
    assignOwner(kind, id, owner) {
      if (!owner.trim()) return;
      const collection =
        kind === "participant"
          ? "participants"
          : kind === "applicant"
            ? "applicants"
            : kind === "task"
              ? "tasks"
              : kind === "support"
                ? "support"
                : kind === "event"
                  ? "events"
                  : kind === "risk"
                    ? "risks"
                    : null;
      if (!collection) return;
      change(id, `Owner assigned to ${owner}`, (d) => {
        const item = d[collection].find((x) => x.id === id);
        if (item) item.owner = owner;
      });
    },
    addNote(s, text) {
      if (!text.trim()) return;
      change(s.id, "Operator note added", () => {}, "note", text.trim());
    },
    queueReminder(s) {
      const d = get().data;
      if (
        d.audit.some(
          (a) =>
            a.entityId === s.id &&
            a.kind === "reminder" &&
            a.at.slice(0, 10) === d.now.slice(0, 10),
        )
      ) {
        set({
          toast: "A reminder draft already exists for this record today.",
        });
        return;
      }
      change(
        s.id,
        "Reminder draft queued for human review",
        () => {},
        "reminder",
        "Please review the outstanding programme action and let your coordinator know if you need support. Template only; no message sent.",
      );
    },
    advanceTime() {
      change("clock", "Operational clock advanced by 3 days", (d) => {
        d.now = new Date(Date.parse(d.now) + 3 * 86400000).toISOString();
      });
    },
    reset() {
      const data = createSeed(),
        saved = localRepository.save(data);
      set({
        data,
        cohortId: "winter",
        stage: null,
        filter: "all",
        query: "",
        selection: null,
        toast: "Synthetic demo restored",
        storageNotice: saved
          ? ""
          : "Storage unavailable. Reset applies only to this session.",
      });
    },
    dismissToast() {
      set({ toast: "" });
    },
  };
});
