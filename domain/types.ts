export const LIFECYCLE = [
  "Recruit",
  "Screen",
  "Offer",
  "Visa",
  "Onboard",
  "Launch",
  "In Programme",
  "Alumni",
] as const;
export type Lifecycle = (typeof LIFECYCLE)[number];
export const APPLICATION_STAGES = [
  "Application",
  "Initial screen",
  "Assessment",
  "Interview",
  "Offer",
  "Accepted",
] as const;
export type ApplicationStage = (typeof APPLICATION_STAGES)[number];
export type Priority = "high" | "medium" | "low";
export type EntityKind =
  "participant" | "applicant" | "task" | "support" | "event" | "risk";
export type Selection = { kind: EntityKind; id: string };
export interface Cohort {
  id: string;
  name: string;
  dates: string;
  launch: string;
  stage: Lifecycle;
  capacity: number;
  location: string;
}
export interface Applicant {
  id: string;
  cohortId: string;
  name: string;
  email: string;
  focus: string;
  stage: ApplicationStage;
  stageEntered: string;
  owner: string;
  complete: boolean;
  feedback: boolean;
}
export interface Requirement {
  id: string;
  label: string;
  kind: "document" | "onboarding" | "allocation";
  complete: boolean;
}
export interface Participant {
  owner: string;
  id: string;
  cohortId: string;
  name: string;
  email: string;
  focus: string;
  stage: Lifecycle;
  team: string;
  supervisor: string;
  arrival: string;
  requirements: Requirement[];
}
export interface Task {
  id: string;
  cohortId: string;
  participantId?: string;
  title: string;
  owner: string;
  due: string;
  priority: Priority;
  stage: Lifecycle;
  complete: boolean;
}
export type SupportCategory =
  "access" | "logistics" | "welfare" | "visa" | "complaint";
export interface SupportRequest {
  id: string;
  cohortId: string;
  participantId: string;
  title: string;
  detail: string;
  category: SupportCategory;
  owner: string;
  opened: string;
  resolved: boolean;
}
export interface Room {
  id: string;
  name: string;
  capacity: number;
}
export interface ScheduleEntry {
  id: string;
  cohortId: string;
  title: string;
  roomId: string;
  start: string;
  end: string;
  owner: string;
}
export interface OperationalRisk {
  id: string;
  cohortId: string;
  title: string;
  detail: string;
  owner: string;
  priority: Priority;
  acknowledged: boolean;
  stage: Lifecycle;
}
export interface Milestone {
  id: string;
  cohortId: string;
  title: string;
  due: string;
  stage: Lifecycle;
}
export interface AuditEvent {
  id: string;
  cohortId: string;
  entityId: string;
  at: string;
  action: string;
  actor: string;
  kind: "change" | "note" | "reminder";
  detail: string;
}
export interface Dataset {
  cohorts: Cohort[];
  applicants: Applicant[];
  participants: Participant[];
  tasks: Task[];
  support: SupportRequest[];
  rooms: Room[];
  events: ScheduleEntry[];
  risks: OperationalRisk[];
  milestones: Milestone[];
  audit: AuditEvent[];
  now: string;
}
export interface WorkItem {
  id: string;
  selection: Selection;
  title: string;
  detail: string;
  owner: string;
  priority: Priority;
  stage: Lifecycle;
  category:
    "documents" | "admissions" | "support" | "logistics" | "tasks" | "risk";
  due?: string;
  escalation: boolean;
}
