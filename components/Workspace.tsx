"use client";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Command,
  FileText,
  GitBranch,
  PanelLeftClose,
  RotateCcw,
  Users,
  X,
  Clock3,
} from "lucide-react";
import { useOpsStore, type View } from "@/store/useOpsStore";
import { CohortControl } from "@/features/CohortControl";
import { Admissions } from "@/features/Admissions";
import { ParticipantOps } from "@/features/ParticipantOps";
import { OperationsBrief } from "@/features/OperationsBrief";
import { Inspector } from "@/features/Inspector";
import { CommandMenu } from "@/features/CommandMenu";
import { ConfirmDialog } from "./dialogs";
import { formatDate } from "./ui";
const navigation = [
  { id: "control", label: "Cohort Control", icon: Activity },
  { id: "admissions", label: "Admissions Flow", icon: GitBranch },
  { id: "participants", label: "Participant Ops", icon: Users },
  { id: "brief", label: "Operations Brief", icon: FileText },
] as const;
const headings: Record<View, { label: string; description: string }> = {
  control: {
    label: "Cohort Control",
    description: "Keep the programme moving. Give every exception an owner.",
  },
  admissions: {
    label: "Admissions Flow",
    description: "A clear path from application to accepted offer.",
  },
  participants: {
    label: "Participant Ops",
    description:
      "From accepted offer to a supported, programme-ready participant.",
  },
  brief: {
    label: "Operations Brief",
    description: "A shared operating picture, grounded in the current records.",
  },
};
export function Workspace() {
  const s = useOpsStore();
  const [commandOpen, setCommandOpen] = useState(false),
    [resetOpen, setResetOpen] = useState(false),
    [aboutOpen, setAboutOpen] = useState(false),
    [mobileNav, setMobileNav] = useState(false);
  useEffect(() => {
    useOpsStore.getState().hydrate();
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      ) {
        e.preventDefault();
        document
          .querySelector<HTMLInputElement>(".search-field input")
          ?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (!s.toast) return;
    const t = setTimeout(() => useOpsStore.getState().dismissToast(), 4500);
    return () => clearTimeout(t);
  }, [s.toast]);
  const cohort = s.data.cohorts.find((c) => c.id === s.cohortId)!;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to workspace
      </a>
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="brand">
          <span className="brand-symbol">
            S
            <span>
              <ArrowUpRight size={16} />
            </span>
          </span>
          <div>
            ScaleOps<small>PROGRAMME OPERATIONS</small>
          </div>
          <button
            className="mobile-only icon-button"
            aria-label="Close navigation"
            onClick={() => setMobileNav(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-label">
          WORKSPACE <span>01</span>
        </div>
        <label className="cohort-picker">
          <span className="cohort-dot" />
          <select
            aria-label="Cohort"
            value={s.cohortId}
            onChange={(e) => s.setCohort(e.target.value)}
          >
            {s.data.cohorts.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} />
        </label>
        <nav aria-label="Workspace">
          {navigation.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${s.view === n.id ? "active" : ""}`}
              onClick={() => {
                s.setView(n.id);
                setMobileNav(false);
              }}
            >
              <n.icon size={18} />
              {n.label}
              {s.view === n.id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="small-dot" /> A quieter way to scale.
          <p>
            One cohort. Clear ownership.
            <br />
            Fewer things falling through.
          </p>
        </div>
        <div className="sidebar-bottom">
          <button onClick={() => setAboutOpen(true)}>
            <BookOpen size={16} /> About this workspace
            <ArrowUpRight size={14} />
          </button>
          <button onClick={() => setResetOpen(true)}>
            <RotateCcw size={16} /> Reset demonstration
          </button>
          <div className="operator">
            <span className="operator-avatar">DO</span>
            <div>
              Demo operator<small>Local workspace · no messages sent</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-only icon-button"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation"
            >
              <PanelLeftClose size={18} />
            </button>
            <span>Workspace</span>
            <span>/</span>
            <strong>{cohort.name}</strong>
          </div>
          <div className="topbar-actions">
            <span className="demo-label">
              <span /> Synthetic demo
            </span>
            <button
              className="command-trigger"
              aria-label="Search & commands"
              onClick={() => setCommandOpen(true)}
            >
              <Command size={15} />
              <span>Search & commands</span>
              <kbd>⌘ K</kbd>
            </button>
          </div>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {s.view === "control"
                  ? "THE COHORT OPERATING SYSTEM"
                  : s.view === "brief"
                    ? "WEEKLY · OPERATOR EDITION"
                    : "PROGRAMME WORKSPACE"}
              </div>
              <h1>
                {headings[s.view].label}
                <span className="heading-dot">.</span>
              </h1>
              <p>{headings[s.view].description}</p>
            </div>
            <div className="clock-control">
              <span>
                <Clock3 size={13} /> Demo clock · {formatDate(s.data.now)} 2027
              </span>
              <button onClick={s.advanceTime}>
                Simulate +3 days <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
          {s.storageNotice && (
            <div className="notice" role="alert">
              {s.storageNotice}
            </div>
          )}
          {!s.hydrated ? (
            <div className="loading-surface" role="status">
              Loading your local workspace…
            </div>
          ) : s.view === "control" ? (
            <CohortControl />
          ) : s.view === "admissions" ? (
            <Admissions key={s.cohortId} />
          ) : s.view === "participants" ? (
            <ParticipantOps key={s.cohortId} />
          ) : (
            <OperationsBrief key={s.cohortId} />
          )}
          <footer className="workspace-footer">
            <span>
              Independent portfolio prototype · Synthetic demonstration data —
              not LASR internal data.
            </span>
            <span>
              RULES, THEN AUTOMATION{" "}
              <span className="footer-mark">
                <ArrowUpRight size={16} />
              </span>
            </span>
          </footer>
        </main>
      </div>
      <Inspector />
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
      {s.toast && (
        <div className="toast" role="status">
          <span className="small-dot" />
          {s.toast}
          <button aria-label="Dismiss notification" onClick={s.dismissToast}>
            <X size={14} />
          </button>
        </div>
      )}
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset synthetic data?"
        description="This clears your local edits, notes and reminder drafts across all three cohorts. The original demonstration records will return."
        confirmLabel="Reset demo data"
        onConfirm={s.reset}
      />
      <ConfirmDialog
        open={aboutOpen}
        onOpenChange={setAboutOpen}
        title="An operating system for the cohort"
        description="ScaleOps is an independent portfolio prototype for programme operations. All names, dates, teams and records are fictional. Rules surface coordination needs; people retain admissions, legal and welfare decisions. Data stays in this browser. Reminder drafts are templates, never sent. No live AI model is connected."
        confirmLabel="Back to workspace"
        onConfirm={() => {}}
      />
    </div>
  );
}
