import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  CircleAlert,
  ListFilter,
  MapPin,
  Users,
} from "lucide-react";
import { useOpsStore, type Filter } from "@/store/useOpsStore";
import { LIFECYCLE } from "@/domain/types";
import { cohortMetrics, workQueue } from "@/domain/OpsEngine";
import {
  Empty,
  formatDate,
  formatTime,
  SectionHead,
  Tag,
  SearchInput,
} from "@/components/ui";
const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All attention" },
  { value: "documents", label: "Documents" },
  { value: "admissions", label: "Admissions" },
  { value: "support", label: "Support" },
  { value: "logistics", label: "Logistics" },
  { value: "overdue", label: "Overdue" },
];
export function CohortControl() {
  const s = useOpsStore(),
    c = s.data.cohorts.find((c) => c.id === s.cohortId)!,
    m = cohortMetrics(s.data, s.cohortId),
    queue = workQueue(s.data, s.cohortId);
  const visible = queue.filter(
    (q) =>
      (!s.stage || q.stage === s.stage) &&
      (s.filter === "all" ||
        (s.filter === "overdue" &&
          q.due &&
          Date.parse(q.due) < Date.parse(s.data.now)) ||
        q.category === s.filter) &&
      `${q.title} ${q.detail} ${q.owner}`
        .toLowerCase()
        .includes(s.query.toLowerCase()),
  );
  const milestones = s.data.milestones.filter(
    (m) => m.cohortId === s.cohortId && (!s.stage || m.stage === s.stage),
  );
  const events = s.data.events.filter((e) => e.cohortId === s.cohortId);
  return (
    <>
      <section className="cohort-overview" aria-label="Cohort status">
        <div className="cohort-title">
          <h2>
            {c.name}
            <Tag>{c.stage}</Tag>
          </h2>
          <p>
            <MapPin size={13} />
            {c.location}
            <span>·</span>
            {c.dates}
          </p>
          <div className="cohort-meta">
            <span>
              <Users size={14} />
              {m.participants.length} participants
            </span>
            <span>
              {new Set(m.participants.map((p) => p.team)).size} research teams
            </span>
            <span>
              {new Set(m.participants.map((p) => p.supervisor)).size}{" "}
              supervisors
            </span>
          </div>
        </div>
        <div className="readiness-summary">
          <div className="readiness-value">
            {m.readiness}
            <span>%</span>
          </div>
          <div>
            <strong>Checklist readiness</strong>
            <p>
              {m.ready} of {m.participants.length} participants ready
            </p>
            <div className="mini-progress">
              <span style={{ width: `${m.readiness}%` }} />
            </div>
          </div>
        </div>
        <div className="launch-status">
          <span className="eyebrow">LAUNCH CHECK</span>
          <strong>
            {m.launchReady ? (
              <>
                <CheckCheck size={17} /> Clear to coordinate
              </>
            ) : (
              <>
                <CircleAlert size={17} /> Needs attention
              </>
            )}
          </strong>
          <p>
            {m.conflicts.length} room overlap · {m.unresolvedSupport.length}{" "}
            support requests
          </p>
          <button onClick={() => s.setView("participants")}>
            Review participant readiness <ArrowRight size={14} />
          </button>
        </div>
      </section>
      <section className="lifecycle" aria-label="Programme lifecycle">
        {LIFECYCLE.map((stage, i) => (
          <button
            key={stage}
            aria-pressed={s.stage === stage}
            className={`${stage === c.stage ? "current" : ""} ${s.stage === stage ? "selected" : ""}`}
            onClick={() => s.setStage(s.stage === stage ? null : stage)}
          >
            <span className="stage-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{stage}</span>
            {stage === c.stage && <span className="stage-current">NOW</span>}
          </button>
        ))}
      </section>
      <div className="control-columns">
        <section className="queue-surface">
          <SectionHead eyebrow="OPEN EXCEPTIONS" title="The attention queue">
            <span className="count-label">{queue.length} open items</span>
          </SectionHead>
          <div className="queue-tools">
            <div className="filter-tabs">
              {filters.map((f) => (
                <button
                  key={f.value}
                  aria-pressed={s.filter === f.value}
                  className={s.filter === f.value ? "selected" : ""}
                  onClick={() => s.setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <SearchInput
              value={s.query}
              onChange={s.setQuery}
              placeholder="Search attention queue…"
            />
          </div>
          {s.stage && (
            <div className="active-filter">
              <ListFilter size={13} /> Lifecycle: {s.stage}
              <button onClick={() => s.setStage(null)}>Clear</button>
            </div>
          )}
          <div className="queue-column-labels">
            <span>ITEM / CONTEXT</span>
            <span>OWNER</span>
            <span>PRIORITY</span>
          </div>
          <div className="work-queue">
            {visible.length ? (
              visible.map((q) => (
                <button
                  className={`queue-row ${s.selection?.kind === q.selection.kind && s.selection?.id === q.selection.id ? "record-selected" : ""}`}
                  aria-pressed={
                    s.selection?.kind === q.selection.kind &&
                    s.selection?.id === q.selection.id
                  }
                  key={q.id}
                  onClick={() => s.select(q.selection)}
                >
                  <span className={`queue-marker ${q.priority}`} />
                  <span className="queue-record">
                    <strong>{q.title}</strong>
                    <small>
                      {q.detail}
                      {q.due && ` · ${formatDate(q.due)}`}
                    </small>
                  </span>
                  <span className="queue-owner">{q.owner}</span>
                  <span className={`priority-label ${q.priority}`}>
                    {q.escalation ? "Human review" : q.priority}
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              ))
            ) : (
              <Empty
                title="Nothing in this queue"
                detail="Try another stage or clear your filters to see other owned actions."
              />
            )}
          </div>
          <div className="queue-foot">
            <span>
              {visible.length} of {queue.length} items shown
            </span>
            <button onClick={s.clearFilters}>
              Clear filters <ArrowRight size={13} />
            </button>
          </div>
        </section>
        <aside className="context-column">
          <section className="milestone-surface">
            <SectionHead eyebrow="WHAT’S NEXT" title="Programme markers">
              <CalendarDays size={18} />
            </SectionHead>
            <div className="timeline">
              {milestones.length ? (
                milestones.map((ms) => (
                  <button key={ms.id} onClick={() => s.setStage(ms.stage)}>
                    <span className="timeline-node" />
                    <span>
                      <small>
                        {formatDate(ms.due)}
                        {Date.parse(ms.due) < Date.parse(s.data.now)
                          ? " · past due"
                          : ""}
                      </small>
                      <strong>{ms.title}</strong>
                      <span>{ms.stage}</span>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                ))
              ) : (
                <p className="muted">No milestones in this lifecycle stage.</p>
              )}
            </div>
          </section>
          <section className="logistics-surface">
            <SectionHead eyebrow="SPACE & TIME" title="Room ledger" />
            <div
              className={`conflict-banner ${m.conflicts.length ? "" : "clear"}`}
            >
              {m.conflicts.length ? (
                <>
                  <CircleAlert size={15} />
                  {m.conflicts.length} overlap needs a new room
                </>
              ) : (
                <>
                  <CheckCheck size={15} />
                  No booking overlaps
                </>
              )}
            </div>
            {events.map((e) => (
              <button
                key={e.id}
                className={`event-line ${s.selection?.kind === "event" && s.selection.id === e.id ? "record-selected" : ""}`}
                aria-pressed={
                  s.selection?.kind === "event" && s.selection.id === e.id
                }
                onClick={() => s.select({ kind: "event", id: e.id })}
              >
                <span>
                  <small>
                    {formatDate(e.start)} · {formatTime(e.start)}–
                    {formatTime(e.end)}
                  </small>
                  <strong>{e.title}</strong>
                  <span>
                    {s.data.rooms.find((r) => r.id === e.roomId)?.name}
                  </span>
                </span>
                <ArrowUpRight size={14} />
              </button>
            ))}
          </section>
        </aside>
      </div>
    </>
  );
}
