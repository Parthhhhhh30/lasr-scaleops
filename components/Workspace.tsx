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
  Users,
  X,
} from "lucide-react";
import { useOpsStore, type View } from "@/store/useOpsStore";
import { CohortControl } from "@/features/CohortControl";
import { Admissions } from "@/features/Admissions";
import { ParticipantOps } from "@/features/ParticipantOps";
import { OperationsBrief } from "@/features/OperationsBrief";
import { Inspector } from "@/features/Inspector";
import { CommandMenu } from "@/features/CommandMenu";
import { ConfirmDialog } from "./dialogs";
import { DemoControls } from "./DemoControls";
import { SPLIT_INSPECTOR_QUERY, useMediaQuery } from "./useMediaQuery";
const navigation = [
  { id: "control", label: "Cohort Control", icon: Activity },
  { id: "admissions", label: "Admissions Flow", icon: GitBranch },
  { id: "participants", label: "Participant Ops", icon: Users },
  { id: "brief", label: "Operations Brief", icon: FileText },
] as const;
const headings: Record<View, { label: string; description: string }> = {
  control: {
    label: "Cohort Control",
    description:
      "Open exceptions, programme deadlines and coordination checks.",
  },
  admissions: {
    label: "Admissions Flow",
    description:
      "Application stages, reviewer ownership and outstanding feedback.",
  },
  participants: {
    label: "Participant Ops",
    description: "Participant checklists, allocations and support requests.",
  },
  brief: {
    label: "Current Operations Brief",
    description: "Recomputed automatically from the current operational state.",
  },
};
export function Workspace() {
  const s = useOpsStore(),
    desktop = useMediaQuery(SPLIT_INSPECTOR_QUERY);
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
        ) &&
        !document.querySelector('[role="dialog"]')
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
    <div
      className={`app-shell ${desktop && s.selection ? "inspect-open" : ""}`}
    >
      <a className="skip-link" href="#main">
        Skip to workspace
      </a>
      <aside
        className={`sidebar ${mobileNav ? "mobile-open" : ""}`}
        aria-label="Workspace navigation"
      >
        <div className="brand">
          <span className="brand-symbol">
            C
            <span>
              <ArrowUpRight size={16} />
            </span>
          </span>
          <div>
            CohortOps<small>PROGRAMME OPERATIONS</small>
          </div>
          <button
            className="mobile-only icon-button"
            aria-label="Close navigation"
            onClick={() => setMobileNav(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-label">ACTIVE COHORT</div>
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
              aria-current={s.view === n.id ? "page" : undefined}
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
        <div className="sidebar-context">
          <span className="small-dot" />
          <span>Local demonstration</span>
          <p>
            Changes saved in this browser.
            <br />
            Reminder drafts are never sent.
          </p>
        </div>
        <div className="sidebar-bottom">
          <button onClick={() => setAboutOpen(true)}>
            <BookOpen size={16} />
            About this workspace
            <ArrowUpRight size={14} />
          </button>
          <div className="operator">
            <span className="operator-avatar">DO</span>
            <div>
              Demo operator<small>Synthetic data only</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-only icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <PanelLeftClose size={18} />
            </button>
            <span>Workspace</span>
            <span>/</span>
            <strong>{cohort.name}</strong>
          </div>
          <div className="topbar-actions">
            <DemoControls onReset={() => setResetOpen(true)} />
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
              <h1 id="workspace-heading" tabIndex={-1}>
                {headings[s.view].label}
                <span className="heading-dot" aria-hidden="true">
                  .
                </span>
              </h1>
              <p>{headings[s.view].description}</p>
            </div>
            <span className="demo-label">
              <span />
              Synthetic demo
            </span>
          </div>
          {s.storageNotice && (
            <div className="notice" role="alert">
              {s.storageNotice}
            </div>
          )}
          <section
            id="workspace-surface"
            className="workspace-surface"
            aria-labelledby="workspace-heading"
            tabIndex={-1}
            key={`${s.view}-${s.cohortId}`}
          >
            {!s.hydrated ? (
              <div className="loading-surface" role="status">
                Loading your local workspace…
              </div>
            ) : s.view === "control" ? (
              <CohortControl />
            ) : s.view === "admissions" ? (
              <Admissions />
            ) : s.view === "participants" ? (
              <ParticipantOps />
            ) : (
              <OperationsBrief />
            )}
          </section>
          <footer className="workspace-footer">
            Synthetic demonstration data — not LASR internal data.
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
        title="About CohortOps"
        description="CohortOps is an independent programme operations prototype designed around the LASR Programme Operations Associate use case. It is not affiliated with LASR or Arcadia Impact. All names, dates, teams and records are fictional. Surface the exception, name the owner and close the loop: deterministic rules support coordination; people retain admissions, legal and welfare decisions. Data stays in this browser. Reminder drafts are templates, never sent. No live AI model is connected."
        confirmLabel="Back to workspace"
        onConfirm={() => {}}
      />
    </div>
  );
}
