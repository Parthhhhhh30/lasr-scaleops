import { z } from "zod";
import { APPLICATION_STAGES, LIFECYCLE, type Dataset } from "@/domain/types";
import { createSeed } from "./seed";
const date = z.string().datetime(),
  id = z.string().min(1),
  text = z.string(),
  priority = z.enum(["high", "medium", "low"]);
const datasetSchema = z.object({
  now: date,
  cohorts: z.array(
    z.object({
      id,
      name: text,
      dates: text,
      launch: date,
      stage: z.enum(LIFECYCLE),
      capacity: z.number(),
      location: text,
    }),
  ),
  applicants: z.array(
    z.object({
      id,
      cohortId: id,
      name: text,
      email: text,
      focus: text,
      stage: z.enum(APPLICATION_STAGES),
      stageEntered: date,
      owner: text,
      complete: z.boolean(),
      feedback: z.boolean(),
    }),
  ),
  participants: z.array(
    z.object({
      owner: text,
      id,
      cohortId: id,
      name: text,
      email: text,
      focus: text,
      stage: z.enum(LIFECYCLE),
      team: text,
      supervisor: text,
      arrival: date,
      requirements: z.array(
        z.object({
          id,
          label: text,
          kind: z.enum(["document", "onboarding", "allocation"]),
          complete: z.boolean(),
        }),
      ),
    }),
  ),
  tasks: z.array(
    z.object({
      id,
      cohortId: id,
      participantId: id.optional(),
      title: text,
      owner: text,
      due: date,
      priority,
      stage: z.enum(LIFECYCLE),
      complete: z.boolean(),
    }),
  ),
  support: z.array(
    z.object({
      id,
      cohortId: id,
      participantId: id,
      title: text,
      detail: text,
      category: z.enum(["access", "logistics", "welfare", "visa", "complaint"]),
      owner: text,
      opened: date,
      resolved: z.boolean(),
    }),
  ),
  rooms: z.array(z.object({ id, name: text, capacity: z.number() })),
  events: z.array(
    z.object({
      id,
      cohortId: id,
      title: text,
      roomId: id,
      start: date,
      end: date,
      owner: text,
    }),
  ),
  risks: z.array(
    z.object({
      id,
      cohortId: id,
      title: text,
      detail: text,
      owner: text,
      priority,
      acknowledged: z.boolean(),
      stage: z.enum(LIFECYCLE),
    }),
  ),
  milestones: z.array(
    z.object({
      id,
      cohortId: id,
      title: text,
      due: date,
      stage: z.enum(LIFECYCLE),
    }),
  ),
  audit: z.array(
    z.object({
      id,
      cohortId: id,
      entityId: id,
      at: date,
      action: text,
      actor: text,
      kind: z.enum(["change", "note", "reminder"]),
      detail: text,
    }),
  ),
});
export interface DataRepository {
  load(): { data: Dataset; notice?: string };
  save(data: Dataset): boolean;
  reset(): boolean;
}
const KEY = "scaleops.dataset.v1";
export const localRepository: DataRepository = {
  load() {
    try {
      const saved = localStorage.getItem(KEY);
      if (!saved) return { data: createSeed() };
      const result = datasetSchema.safeParse(JSON.parse(saved));
      if (result.success) return { data: result.data };
      return {
        data: createSeed(),
        notice:
          "Saved data has an incompatible format. A fresh demo was loaded.",
      };
    } catch {
      return {
        data: createSeed(),
        notice:
          "Local storage could not be read. Changes may only last for this session.",
      };
    }
  },
  save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  },
  reset() {
    try {
      localStorage.removeItem(KEY);
      return true;
    } catch {
      return false;
    }
  },
};
