import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpDown,
  Columns3,
  List,
  MoveRight,
  UserCheck,
} from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import { APPLICATION_STAGES, type ApplicationStage } from "@/domain/types";
import { slaBreached, stageAge } from "@/domain/OpsEngine";
import { Avatar, Empty, OpenArrow, SearchInput, Tag } from "@/components/ui";
import { ConfirmDialog } from "@/components/dialogs";
export function Admissions() {
  const s = useOpsStore();
  const [representation, setRepresentation] = useState<"table" | "board">(
      "table",
    ),
    [stage, setStage] = useState<ApplicationStage | "">(""),
    [sort, setSort] = useState<"age" | "name">("age"),
    [owner, setOwner] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [nextStage, setNextStage] = useState<ApplicationStage>("Initial screen"),
    [confirm, setConfirm] = useState(false),
    [boardMove, setBoardMove] = useState<{
      id: string;
      name: string;
      stage: ApplicationStage;
    } | null>(null);
  const movedTicket = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (!movedTicket.current) return;
    const target = Array.from(
      document.querySelectorAll<HTMLSelectElement>(".ticket-move select"),
    ).find(
      (element) => element.dataset.focusKey === `board-${movedTicket.current}`,
    );
    movedTicket.current = null;
    if (target) {
      target.scrollIntoView({ block: "nearest", inline: "nearest" });
      target.focus({ preventScroll: true });
    } else
      document
        .querySelector<HTMLElement>("#workspace-surface")
        ?.focus({ preventScroll: true });
  }, [s.data.applicants]);
  useEffect(
    () =>
      useOpsStore.subscribe((state, previous) => {
        if (state.filterResetVersion !== previous.filterResetVersion) {
          setStage("");
          setOwner("");
          setSelected([]);
        }
      }),
    [],
  );
  const moveTicket = (id: string, destination: ApplicationStage) => {
    movedTicket.current = id;
    s.moveApplicant(id, destination);
  };
  const all = s.data.applicants.filter((a) => a.cohortId === s.cohortId);
  const filtered = all
    .filter(
      (a) =>
        (!stage || a.stage === stage) &&
        (!owner || a.owner === owner) &&
        `${a.name} ${a.focus} ${a.owner}`
          .toLowerCase()
          .includes(s.query.toLowerCase()) &&
        (s.filter !== "overdue" || slaBreached(a, s.data.now)),
    )
    .sort((a, b) =>
      sort === "age"
        ? stageAge(b, s.data.now) - stageAge(a, s.data.now)
        : a.name.localeCompare(b.name),
    );
  const ids = selected.filter((id) => filtered.some((a) => a.id === id));
  const move = () => {
    ids.forEach((id) => s.moveApplicant(id, nextStage));
    setSelected([]);
  };
  const batch = () => {
    if (["Offer", "Accepted"].includes(nextStage)) setConfirm(true);
    else move();
  };
  const toggle = (id: string) =>
    setSelected((v) =>
      v.includes(id) ? v.filter((x) => x !== id) : [...v, id],
    );
  return (
    <>
      <div className="admissions-summary">
        <div>
          <span className="eyebrow">PIPELINE HEALTH</span>
          <p>
            <strong>{all.length}</strong> applications ·{" "}
            <strong className="danger-text">
              {all.filter((a) => slaBreached(a, s.data.now)).length}
            </strong>{" "}
            past the 72-hour review window
          </p>
        </div>
        <span className="boundary-copy">
          <UserCheck size={16} /> Selection decisions remain with reviewers
        </span>
      </div>
      <div className="stage-strip">
        <button className={!stage ? "active" : ""} onClick={() => setStage("")}>
          All stages <span>{all.length}</span>
        </button>
        {APPLICATION_STAGES.map((st) => (
          <button
            key={st}
            className={stage === st ? "active" : ""}
            onClick={() => setStage(stage === st ? "" : st)}
          >
            {st}
            <span>{all.filter((a) => a.stage === st).length}</span>
          </button>
        ))}
      </div>
      <div className="table-toolbar">
        <SearchInput
          value={s.query}
          onChange={s.setQuery}
          placeholder="Search applicants…"
        />
        <label className="select-label">
          Owner
          <select
            aria-label="Filter reviewer"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option value="">All reviewers</option>
            {Array.from(new Set(all.map((a) => a.owner))).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <button
          className="button"
          onClick={() => setSort(sort === "age" ? "name" : "age")}
        >
          <ArrowUpDown size={14} />
          {sort === "age" ? "Longest wait" : "Name A–Z"}
        </button>
        <div className="view-toggle" aria-label="Admissions representation">
          <button
            aria-pressed={representation === "table"}
            aria-label="Table view"
            onClick={() => setRepresentation("table")}
          >
            <List size={16} />
          </button>
          <button
            aria-pressed={representation === "board"}
            aria-label="Board view"
            onClick={() => setRepresentation("board")}
          >
            <Columns3 size={16} />
          </button>
        </div>
      </div>
      {s.filter === "overdue" && (
        <div className="active-filter">
          Applications waiting &gt;72 hours
          <button onClick={s.clearFilters}>Clear</button>
        </div>
      )}
      {ids.length > 0 && (
        <div className="batch-bar">
          <strong>{ids.length} selected</strong>
          <label>
            Move to
            <select
              aria-label="Batch destination"
              value={nextStage}
              onChange={(e) => setNextStage(e.target.value as ApplicationStage)}
            >
              {APPLICATION_STAGES.map((st) => (
                <option key={st}>{st}</option>
              ))}
            </select>
          </label>
          <button className="button primary" onClick={batch}>
            Move selected <MoveRight size={14} />
          </button>
          <button onClick={() => setSelected([])}>Clear selection</button>
        </div>
      )}
      {representation === "table" ? (
        <div className="table-scroll">
          <table className="operating-table">
            <thead>
              <tr>
                <th>
                  <input
                    aria-label="Select all visible applicants"
                    type="checkbox"
                    checked={
                      filtered.length > 0 && ids.length === filtered.length
                    }
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? filtered.map((a) => a.id) : [],
                      )
                    }
                  />
                </th>
                <th>Applicant / research interest</th>
                <th>Stage</th>
                <th>Reviewer</th>
                <th>Stage age</th>
                <th>Next attention</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className={
                    s.selection?.kind === "applicant" && s.selection.id === a.id
                      ? "record-selected"
                      : ""
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${a.name}`}
                      checked={ids.includes(a.id)}
                      onChange={() => toggle(a.id)}
                    />
                  </td>
                  <td>
                    <button
                      className="person-cell"
                      aria-expanded={
                        s.selection?.kind === "applicant" &&
                        s.selection.id === a.id
                      }
                      onClick={() => s.select({ kind: "applicant", id: a.id })}
                    >
                      <Avatar name={a.name} />
                      <span>
                        <strong>{a.name}</strong>
                        <small>{a.focus}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <span className="stage-label">{a.stage}</span>
                  </td>
                  <td>{a.owner}</td>
                  <td>
                    <span
                      className={
                        slaBreached(a, s.data.now) ? "danger-text" : "muted"
                      }
                    >
                      {stageAge(a, s.data.now)}h
                      {slaBreached(a, s.data.now) && " · SLA"}
                    </span>
                  </td>
                  <td>
                    {!a.complete ? (
                      <Tag tone="warning">Incomplete application</Tag>
                    ) : !a.feedback &&
                      ["Initial screen", "Assessment", "Interview"].includes(
                        a.stage,
                      ) ? (
                      <Tag tone="danger">Feedback missing</Tag>
                    ) : a.stage === "Accepted" ? (
                      <Tag tone="good">Accepted</Tag>
                    ) : (
                      <span className="muted">No exception</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Open ${a.name}`}
                      onClick={() => s.select({ kind: "applicant", id: a.id })}
                    >
                      <OpenArrow />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <Empty
              title="No applicants match"
              detail="Clear the stage, reviewer or search to return to the pipeline."
            />
          )}
        </div>
      ) : (
        <div className="admissions-board">
          {APPLICATION_STAGES.filter((st) => !stage || st === stage).map(
            (st) => (
              <section key={st}>
                <header>
                  <h3>{st}</h3>
                  <span>{filtered.filter((a) => a.stage === st).length}</span>
                </header>
                {filtered
                  .filter((a) => a.stage === st)
                  .map((a) => (
                    <article
                      className={`applicant-ticket ${s.selection?.kind === "applicant" && s.selection.id === a.id ? "record-selected" : ""}`}
                      key={a.id}
                    >
                      <button
                        className="ticket-open"
                        aria-pressed={
                          s.selection?.kind === "applicant" &&
                          s.selection.id === a.id
                        }
                        onClick={() =>
                          s.select({ kind: "applicant", id: a.id })
                        }
                      >
                        <span>
                          <Avatar name={a.name} />
                          <strong>{a.name}</strong>
                        </span>
                        <p>{a.focus}</p>
                      </button>
                      <footer>
                        <span>{a.owner.split(" ")[0]}</span>
                        <span
                          className={
                            slaBreached(a, s.data.now) ? "danger-text" : ""
                          }
                        >
                          {stageAge(a, s.data.now)}h
                        </span>
                      </footer>
                      {!a.feedback &&
                        ["Initial screen", "Assessment", "Interview"].includes(
                          a.stage,
                        ) && (
                          <small className="danger-text">
                            Reviewer feedback missing
                          </small>
                        )}
                      <label className="ticket-move">
                        Move to
                        <select
                          aria-label={`Move ${a.name} to stage`}
                          data-focus-key={`board-${a.id}`}
                          value={a.stage}
                          onChange={(e) => {
                            const destination = e.target
                              .value as ApplicationStage;
                            if (destination === a.stage) return;
                            if (["Offer", "Accepted"].includes(destination))
                              setBoardMove({
                                id: a.id,
                                name: a.name,
                                stage: destination,
                              });
                            else moveTicket(a.id, destination);
                          }}
                        >
                          {APPLICATION_STAGES.map((destination) => (
                            <option key={destination}>{destination}</option>
                          ))}
                        </select>
                      </label>
                    </article>
                  ))}
                {!filtered.some((a) => a.stage === st) && (
                  <p className="board-empty">No applications here</p>
                )}
              </section>
            ),
          )}
        </div>
      )}
      <div className="surface-caption">
        <span>
          {filtered.length} of {all.length} applications · Age resets on stage
          movement
        </span>
        <span>Rule: review stages &gt;72h → operator follow-up</span>
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Record a human admissions decision"
        description={`Moving ${ids.length} applications to ${nextStage} records a decision already made by the responsible reviewers. CohortOps does not assess or select candidates.`}
        confirmLabel="Confirm reviewer decision"
        onConfirm={move}
      />
      <ConfirmDialog
        open={!!boardMove}
        onOpenChange={(open) => {
          if (!open) setBoardMove(null);
        }}
        title="Record a human admissions decision"
        description={`Moving ${boardMove?.name ?? "this applicant"} to ${boardMove?.stage ?? "the next stage"} records a decision already made by the responsible reviewers. CohortOps does not assess or select candidates.`}
        confirmLabel="Confirm reviewer decision"
        onConfirm={() => {
          if (boardMove) moveTicket(boardMove.id, boardMove.stage);
        }}
      />
    </>
  );
}
