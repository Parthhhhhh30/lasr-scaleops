import { useDialogFocus } from "@/components/useDialogFocus";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Search, X } from "lucide-react";
import { useOpsStore, type Filter, type View } from "@/store/useOpsStore";
export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const focusHandlers = useDialogFocus();
  const s = useOpsStore(),
    [query, setQuery] = useState(""),
    [index, setIndex] = useState(0),
    list = useRef<HTMLDivElement>(null),
    executionFocus = useRef<"workspace" | "record" | null>(null);
  const go = (view: View, filter: Filter = "all") => {
    s.setView(view);
    s.setFilter(filter);
  };
  const commands = [
    {
      id: "docs",
      label: "Show visa / document blockers",
      detail: "Participant Ops · human review",
      run: () => go("participants", "documents"),
    },
    {
      id: "waiting",
      label: "Show applications waiting >72 hours",
      detail: "Admissions · review SLA",
      run: () => go("admissions", "overdue"),
    },
    {
      id: "support",
      label: "Show unresolved support requests",
      detail: "Cohort Control · support queue",
      run: () => go("control", "support"),
    },
    {
      id: "rooms",
      label: "Show room conflicts",
      detail: "Cohort Control · logistics",
      run: () => go("control", "logistics"),
    },
    {
      id: "overdue",
      label: "Show overdue actions",
      detail: "Cohort Control · owned tasks",
      run: () => go("control", "overdue"),
    },
    {
      id: "admissions",
      label: "Go to Admissions",
      detail: "Applications and reviewers",
      run: () => go("admissions"),
    },
    {
      id: "participants",
      label: "Go to Participant Ops",
      detail: "Readiness and support",
      run: () => go("participants"),
    },
    {
      id: "brief",
      label: "Open current operations brief",
      detail: "Live state · deterministic rules",
      run: () => go("brief"),
    },
    {
      id: "control",
      label: "Go to Cohort Control",
      detail: "The attention queue",
      run: () => go("control"),
    },
    {
      id: "clear",
      label: "Clear active filters",
      detail: "Reset the current working surface",
      run: s.clearFilters,
    },
    ...s.data.participants
      .filter((p) => p.cohortId === s.cohortId)
      .map((p) => ({
        id: p.id,
        label: p.name,
        detail: `Participant · ${p.team}`,
        run: () => s.select({ kind: "participant", id: p.id }),
      })),
    ...s.data.applicants
      .filter((a) => a.cohortId === s.cohortId)
      .map((a) => ({
        id: a.id,
        label: a.name,
        detail: `Applicant · ${a.stage}`,
        run: () => s.select({ kind: "applicant", id: a.id }),
      })),
  ];
  const results = commands
    .filter((c) =>
      `${c.label} ${c.detail}`.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 30);
  useEffect(() => {
    list.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [index]);
  const execute = (i: number) => {
    const c = results[i];
    if (!c) return;
    executionFocus.current =
      c.id.includes("-p") || c.id.includes("-a") ? "record" : "workspace";
    onOpenChange(false);
    setQuery("");
    setIndex(0);
    c.run();
  };
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setQuery("");
        setIndex(0);
        onOpenChange(v);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          {...focusHandlers}
          onCloseAutoFocus={(event) => {
            const target = executionFocus.current;
            executionFocus.current = null;
            if (!target) {
              focusHandlers.onCloseAutoFocus(event);
              return;
            }
            event.preventDefault();
            document
              .querySelector<HTMLElement>(
                target === "record"
                  ? '.inspector [aria-label="Close inspector"]'
                  : "#workspace-surface",
              )
              ?.focus();
          }}
          className="command-dialog"
        >
          <Dialog.Title className="sr-only">Search and commands</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search current-cohort records or choose an operational command. Use
            arrow keys and Enter.
          </Dialog.Description>
          <div className="command-input">
            <Search size={20} />
            <input
              placeholder="Find a person or run a command…"
              aria-label="Search commands"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-results"
              aria-activedescendant={
                results[index] ? `command-${results[index].id}` : undefined
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setIndex((v) =>
                    results.length ? (v + 1) % results.length : 0,
                  );
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setIndex((v) =>
                    results.length
                      ? (v - 1 + results.length) % results.length
                      : 0,
                  );
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  execute(index);
                }
              }}
            />
            <Dialog.Close className="icon-button" aria-label="Close commands">
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="command-caption">
            {s.data.cohorts.find((c) => c.id === s.cohortId)?.name} · COMMANDS &
            RECORDS
          </div>
          <div
            id="command-results"
            className="command-results"
            role="listbox"
            ref={list}
          >
            {results.length ? (
              results.map((c, i) => (
                <div
                  id={`command-${c.id}`}
                  key={c.id}
                  role="option"
                  aria-selected={index === i}
                  className="command-option"
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => execute(i)}
                >
                  <span>
                    <strong>{c.label}</strong>
                    <small>{c.detail}</small>
                  </span>
                  <ArrowRight size={15} />
                </div>
              ))
            ) : (
              <p className="command-empty">
                No results. Try a name, “room” or “brief”.
              </p>
            )}
          </div>
          <footer>
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> navigate <kbd>↵</kbd> open
            </span>
            <span>
              <kbd>esc</kbd> close
            </span>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
