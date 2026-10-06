import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCheck, ShieldCheck } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import {
  cohortMetrics,
  documentBlockers,
  readiness,
  needsHuman,
} from "@/domain/OpsEngine";
import {
  Avatar,
  Empty,
  formatDate,
  Progress,
  SearchInput,
  Tag,
} from "@/components/ui";
export function ParticipantOps() {
  const s = useOpsStore(),
    [tab, setTab] = useState<"readiness" | "support">("readiness"),
    [status, setStatus] = useState("all");
  useEffect(
    () =>
      useOpsStore.subscribe((state, previous) => {
        if (state.filterResetVersion !== previous.filterResetVersion)
          setStatus("all");
      }),
    [],
  );
  const m = cohortMetrics(s.data, s.cohortId);
  const participants = m.participants.filter(
    (p) =>
      `${p.name} ${p.team} ${p.supervisor}`
        .toLowerCase()
        .includes(s.query.toLowerCase()) &&
      (s.filter !== "documents" || documentBlockers(p).length > 0) &&
      (status === "all" ||
        (status === "ready" && readiness(p) === 100) ||
        (status === "blocked" && readiness(p) < 100)),
  );
  const support = s.data.support.filter(
    (r) =>
      r.cohortId === s.cohortId &&
      (!s.query ||
        `${r.title} ${s.data.participants.find((p) => p.id === r.participantId)?.name}`
          .toLowerCase()
          .includes(s.query.toLowerCase())),
  );
  return (
    <>
      <div className="participant-summary">
        <div>
          <span className="eyebrow">PARTICIPANT READINESS</span>
          <h2>
            {m.ready}
            <span> / {m.participants.length}</span>{" "}
            <small>participants checklist-ready</small>
          </h2>
        </div>
        <p>
          <ShieldCheck size={17} />
          Administrative checks track information.
          <br />
          Visa eligibility and legal advice require human handling.
        </p>
      </div>
      <div className="participant-tabs">
        <button
          aria-pressed={tab === "readiness"}
          className={tab === "readiness" ? "active" : ""}
          onClick={() => setTab("readiness")}
        >
          Readiness register <span>{m.participants.length}</span>
        </button>
        <button
          aria-pressed={tab === "support"}
          className={tab === "support" ? "active" : ""}
          onClick={() => setTab("support")}
        >
          Support requests <span>{m.unresolvedSupport.length} open</span>
        </button>
      </div>
      <div className="table-toolbar">
        <SearchInput
          value={s.query}
          onChange={s.setQuery}
          placeholder="Search participants or support…"
        />
        {tab === "readiness" && (
          <label className="select-label">
            Readiness
            <select
              aria-label="Filter readiness"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All participants</option>
              <option value="blocked">Outstanding items</option>
              <option value="ready">Checklist-ready</option>
            </select>
          </label>
        )}
        <span className="toolbar-detail">
          {tab === "readiness"
            ? "Select a record to complete an item"
            : "Sensitive requests require reviewed human follow-up"}
        </span>
      </div>
      {s.filter === "documents" && (
        <div className="active-filter">
          Document blockers only<button onClick={s.clearFilters}>Clear</button>
        </div>
      )}
      {tab === "readiness" ? (
        <div className="table-scroll">
          <table className="operating-table participant-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Team / supervisor</th>
                <th>Documents</th>
                <th>Readiness</th>
                <th>Arrival</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr
                  key={p.id}
                  className={
                    s.selection?.kind === "participant" &&
                    s.selection.id === p.id
                      ? "record-selected"
                      : ""
                  }
                >
                  <td>
                    <button
                      className="person-cell"
                      aria-expanded={
                        s.selection?.kind === "participant" &&
                        s.selection.id === p.id
                      }
                      onClick={() =>
                        s.select({ kind: "participant", id: p.id })
                      }
                    >
                      <Avatar name={p.name} />
                      <span>
                        <strong>{p.name}</strong>
                        <small>{p.focus}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <strong className="cell-title">{p.team}</strong>
                    <small className="cell-sub">{p.supervisor}</small>
                  </td>
                  <td>
                    {documentBlockers(p).length ? (
                      <Tag tone="warning">
                        {documentBlockers(p).length} outstanding
                      </Tag>
                    ) : (
                      <span className="good-text inline-icon">
                        <CheckCheck size={14} /> Received
                      </span>
                    )}
                  </td>
                  <td>
                    <Progress
                      value={readiness(p)}
                      label={`${p.name} readiness`}
                    />
                  </td>
                  <td>{formatDate(p.arrival)}</td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Open ${p.name}`}
                      onClick={() =>
                        s.select({ kind: "participant", id: p.id })
                      }
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!participants.length && (
            <Empty
              title="No participants match"
              detail="Change the readiness filter or clear your search."
            />
          )}
        </div>
      ) : (
        <div className="support-list">
          {support.map((r) => (
            <button
              key={r.id}
              className={`support-row ${s.selection?.kind === "support" && s.selection.id === r.id ? "record-selected" : ""}`}
              aria-pressed={
                s.selection?.kind === "support" && s.selection.id === r.id
              }
              onClick={() => s.select({ kind: "support", id: r.id })}
            >
              <span className={`queue-marker ${r.resolved ? "low" : "high"}`} />
              <span>
                <strong>{r.title}</strong>
                <small>
                  {
                    s.data.participants.find((p) => p.id === r.participantId)
                      ?.name
                  }{" "}
                  · {r.owner} · opened {formatDate(r.opened)}
                </small>
              </span>
              <Tag
                tone={
                  r.resolved
                    ? "good"
                    : needsHuman(r.category)
                      ? "warning"
                      : "neutral"
                }
              >
                {r.resolved
                  ? "Resolved"
                  : needsHuman(r.category)
                    ? "Human handling"
                    : "Open"}
              </Tag>
              <ArrowUpRight size={16} />
            </button>
          ))}
          {!support.length && (
            <Empty
              title="No support requests match"
              detail="Clear your search to see the support history."
            />
          )}
        </div>
      )}
      <div className="surface-caption">
        <span>
          Readiness = completed checklist items / total checklist items
        </span>
        <span>Checklist-ready is not a legal or admissions decision.</span>
      </div>
    </>
  );
}
