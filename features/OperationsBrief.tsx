import { useState } from "react";
import { ArrowUpRight, Copy, FileCheck2 } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import { weeklyBrief } from "@/domain/OpsEngine";
import { Empty, formatDate, Tag } from "@/components/ui";
export function OperationsBrief() {
  const s = useOpsStore(),
    b = weeklyBrief(s.data, s.cohortId),
    c = s.data.cohorts.find((c) => c.id === s.cohortId)!,
    [copyState, setCopyState] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${c.name} — Current Operations Brief\nAs of ${formatDate(s.data.now)}\n${b.summary}\n\nDecisions required\n${b.decisions.map((d) => `${d.title} — ${d.owner}`).join("\n")}\n\nUnresolved items\n${b.queue.map((q) => `${q.title}: ${q.detail} — ${q.owner}`).join("\n")}\n\nRecent changes\n${b.recent.map((a) => `${a.action}${a.detail ? ": " + a.detail : ""}`).join("\n")}\n\nSynthetic demonstration data — not LASR internal data.`,
      );
      setCopyState("Copied");
    } catch {
      setCopyState("Clipboard unavailable");
    }
  };
  return (
    <div className="brief-layout">
      <article className="brief-paper">
        <header className="brief-masthead">
          <span className="eyebrow">COHORTOPS / CURRENT STATE</span>
          <span>{formatDate(s.data.now)} 2027</span>
        </header>
        <div className="brief-title">
          <span className="brief-issue">LIVE OPERATIONAL BRIEF</span>
          <h2>
            {c.name}
            <br />
            <em>Current coordination state.</em>
          </h2>
          <p>{b.summary}</p>
        </div>
        <div className="brief-verdict">
          <FileCheck2 size={18} />
          <div>
            <strong>
              {b.metrics.launchReady
                ? "Launch coordination checks clear"
                : "Launch coordination has open dependencies"}
            </strong>
            <span>
              Administrative readiness, support, overdue actions and room
              bookings are checked separately.
            </span>
          </div>
          <Tag tone={b.metrics.launchReady ? "good" : "warning"}>
            {b.metrics.readiness}% checklist
          </Tag>
        </div>
        <section className="brief-section">
          <div className="brief-section-number">01</div>
          <div>
            <h3>Decisions & human follow-up</h3>
            <p className="section-intro">
              Sensitive matters stay with people. Acknowledgement records
              review, not resolution.
            </p>
            {b.decisions.length ? (
              b.decisions.map((q) => (
                <button
                  className="brief-action"
                  key={q.id}
                  onClick={() => s.select(q.selection)}
                >
                  <span>
                    <strong>{q.title}</strong>
                    <small>
                      {q.detail} · {q.owner}
                    </small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              ))
            ) : (
              <p className="good-text">
                No unacknowledged decisions or sensitive requests.
              </p>
            )}
          </div>
        </section>
        <section className="brief-section">
          <div className="brief-section-number">02</div>
          <div>
            <h3>Where the pipeline is waiting</h3>
            <p>
              {b.breaches.length} applications exceed the 72-hour review SLA.{" "}
              {b.breaches.length
                ? "Reviewer follow-up is needed; this is an ageing flag, not a candidate score."
                : "There are no review-stage SLA breaches."}
            </p>
            {b.breaches.slice(0, 5).map((a) => (
              <button
                className="brief-action"
                key={a.id}
                onClick={() => s.select({ kind: "applicant", id: a.id })}
              >
                <span>
                  <strong>{a.name}</strong>
                  <small>
                    {a.stage} · {a.owner}
                  </small>
                </span>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
        </section>
        <section className="brief-section">
          <div className="brief-section-number">03</div>
          <div>
            <h3>Participant readiness & logistics</h3>
            <p>
              {b.documents.length} participants have outstanding document
              information. {b.metrics.unresolvedSupport.length} support requests
              remain open. {b.metrics.overdueTasks.length} owned actions are
              overdue.
            </p>
            {b.metrics.conflicts.map(({ a, b }) => (
              <button
                key={a.id + b.id}
                className="brief-action"
                onClick={() => s.select({ kind: "event", id: a.id })}
              >
                <span>
                  <strong>Room overlap: {a.title}</strong>
                  <small>
                    Overlaps {b.title} ·{" "}
                    {s.data.rooms.find((r) => r.id === a.roomId)?.name}
                  </small>
                </span>
                <ArrowUpRight size={15} />
              </button>
            ))}
            {b.upcoming.length > 0 && (
              <div className="upcoming-box">
                <span className="eyebrow">NEXT 7 DAYS</span>
                {b.upcoming.map((m) => (
                  <p key={m.id}>
                    <strong>{m.title}</strong>
                    <span>{formatDate(m.due)}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="brief-section">
          <div className="brief-section-number">04</div>
          <div>
            <h3>Changes this week</h3>
            {b.recent.length ? (
              b.recent.map((a) => (
                <div className="brief-change" key={a.id}>
                  <span className="small-dot" />
                  <div>
                    <strong>{a.action}</strong>
                    <small>
                      {formatDate(a.at)} · {a.actor}
                      {a.detail && ` · ${a.detail}`}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <Empty
                title="A clean starting point"
                detail="Complete an item, move an application or resolve a request. Its audit event will appear here."
              />
            )}
          </div>
        </section>
        <footer className="brief-paper-footer">
          Compiled from current records by deterministic rules. No generative AI
          or external data. Synthetic demonstration data.
        </footer>
      </article>
      <aside className="brief-sidebar">
        <span className="eyebrow">YOUR WORKING BRIEF</span>
        <h3>Live, with source records.</h3>
        <p>
          Recomputed automatically from the current operational state. Every
          statement can be traced back to a queue or audit event.
        </p>
        <button className="button" onClick={copy}>
          <Copy size={15} />
          {copyState || "Copy briefing text"}
        </button>
        <div className="brief-source-list">
          <strong>Included sources</strong>
          <span>Applicant stage clocks</span>
          <span>Participant checklists</span>
          <span>Open support requests</span>
          <span>Room booking overlaps</span>
          <span>Owned actions & milestones</span>
          <span>Last 7 days of audit events</span>
        </div>
        <p className="boundary-note">
          The brief highlights operational decisions. It does not make
          admissions, legal or welfare decisions.
        </p>
      </aside>
    </div>
  );
}
