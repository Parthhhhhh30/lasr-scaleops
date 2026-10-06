import {
  SPLIT_INSPECTOR_QUERY,
  useMediaQuery,
} from "@/components/useMediaQuery";
import { useDialogFocus } from "@/components/useDialogFocus";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Check, FileText, Send, X } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import {
  APPLICATION_STAGES,
  type ApplicationStage,
  type Selection,
} from "@/domain/types";
import {
  documentBlockers,
  needsHuman,
  readiness,
  stageAge,
} from "@/domain/OpsEngine";
import { Avatar, formatDate, formatTime, Progress, Tag } from "@/components/ui";
import { ConfirmDialog } from "@/components/dialogs";
export function Inspector() {
  const focusHandlers = useDialogFocus();
  const s = useOpsStore();
  const desktop = useMediaQuery(SPLIT_INSPECTOR_QUERY);
  return (
    <Dialog.Root
      modal={!desktop}
      open={!!s.selection}
      onOpenChange={(open) => {
        if (!open) s.select(null);
      }}
    >
      <Dialog.Portal>
        {!desktop && <Dialog.Overlay className="inspector-overlay" />}
        <Dialog.Content
          {...focusHandlers}
          className={`inspector ${desktop ? "split-inspector" : "drawer-inspector"}`}
          role={desktop ? "region" : "dialog"}
          onInteractOutside={(event) => {
            if (desktop) event.preventDefault();
          }}
        >
          <Dialog.Title className="sr-only">Record inspector</Dialog.Title>
          <Dialog.Description className="sr-only">
            Review this record, update owned actions, and read the audit
            history.
          </Dialog.Description>
          <div className="inspector-topline">
            <span>RECORD INSPECTOR</span>
            <Dialog.Close className="icon-button" aria-label="Close inspector">
              <X size={20} />
            </Dialog.Close>
          </div>
          {s.selection && (
            <InspectorRecord
              key={`${s.selection.kind}-${s.selection.id}`}
              selection={s.selection}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function InspectorRecord({ selection }: { selection: Selection }) {
  const s = useOpsStore(),
    d = s.data,
    [note, setNote] = useState(""),
    [confirmSupport, setConfirmSupport] = useState(false),
    [confirmStage, setConfirmStage] = useState<ApplicationStage | null>(null);
  const p = d.participants.find((p) => p.id === selection.id),
    a = d.applicants.find((a) => a.id === selection.id),
    t = d.tasks.find((t) => t.id === selection.id),
    support = d.support.find((r) => r.id === selection.id),
    event = d.events.find((e) => e.id === selection.id),
    risk = d.risks.find((r) => r.id === selection.id);
  const record = p ?? a ?? t ?? support ?? event ?? risk;
  if (!record) return <p>Record no longer exists.</p>;
  const title = "name" in record ? record.name : record.title;
  const owner = "owner" in record ? record.owner : null;
  const participantId = p?.id ?? support?.participantId ?? t?.participantId;
  const audit = d.audit
    .filter(
      (e) =>
        e.entityId === selection.id ||
        (participantId &&
          e.entityId !== participantId &&
          d.support.some(
            (r) => r.id === e.entityId && r.participantId === participantId,
          )),
    )
    .slice()
    .reverse();
  return (
    <>
      <header className="inspector-identity">
        <span className="eyebrow">
          {selection.kind.toUpperCase()} / {selection.id}
        </span>
        <div>
          {(p || a) && <Avatar name={title} />}
          <h2>{title}</h2>
        </div>
        {p && (
          <p>
            {p.focus} · {p.email}
          </p>
        )}
        {a && (
          <p>
            {a.focus} · {a.email}
          </p>
        )}
        {support && (
          <button
            className="text-link"
            onClick={() =>
              s.select({ kind: "participant", id: support.participantId })
            }
          >
            {d.participants.find((p) => p.id === support.participantId)?.name}
            <ArrowUpRight size={13} />
          </button>
        )}
      </header>
      <div className="inspector-body">
        {owner && (
          <label className="inspector-field">
            Accountable owner
            <select
              aria-label="Assign owner"
              value={owner}
              onChange={(e) =>
                s.assignOwner(selection.kind, selection.id, e.target.value)
              }
            >
              {Array.from(
                new Set([
                  owner,
                  "Priya Shah",
                  "Alex Turner",
                  "Morgan Ellis",
                  "Demo operator",
                ]),
              ).map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        )}
        {p && (
          <>
            <div className="inspector-readiness">
              <div>
                <strong>Checklist readiness</strong>
                <Tag tone={readiness(p) === 100 ? "good" : "warning"}>
                  {readiness(p) === 100 ? "Ready" : "Outstanding items"}
                </Tag>
              </div>
              <Progress
                value={readiness(p)}
                label={`${p.name} checklist readiness`}
              />
            </div>
            <div className="record-facts">
              <span>
                Team<strong>{p.team}</strong>
              </span>
              <span>
                Supervisor<strong>{p.supervisor}</strong>
              </span>
              <span>
                Arrival<strong>{formatDate(p.arrival)}</strong>
              </span>
              <span>
                Lifecycle<strong>{p.stage}</strong>
              </span>
            </div>
            <h3>Readiness checklist</h3>
            <p className="field-help">
              Mark a requirement only after the responsible person has verified
              it.
            </p>
            <div className="checklist">
              {p.requirements.map((r) => (
                <label key={r.id} className={r.complete ? "done" : ""}>
                  <input
                    type="checkbox"
                    checked={r.complete}
                    onChange={() => s.completeRequirement(p.id, r.id)}
                  />
                  <span>
                    {r.label}
                    <small>{r.kind}</small>
                  </span>
                </label>
              ))}
            </div>
            {documentBlockers(p).length > 0 && (
              <div className="boundary-note">
                Track receipt and human review of documents only. This checklist
                never determines legal visa eligibility.
              </div>
            )}
            <h3>Support history</h3>
            {d.support
              .filter((r) => r.participantId === p.id)
              .map((r) => (
                <button
                  className="inspector-linked"
                  key={r.id}
                  onClick={() => s.select({ kind: "support", id: r.id })}
                >
                  <span>
                    {r.title}
                    <small>
                      {r.resolved ? "Resolved" : "Open · " + r.owner}
                    </small>
                  </span>
                  <ArrowUpRight size={14} />
                </button>
              ))}
            <h3>Owned actions</h3>
            {d.tasks
              .filter((t) => t.participantId === p.id)
              .map((t) => (
                <button
                  className="inspector-linked"
                  key={t.id}
                  onClick={() => s.select({ kind: "task", id: t.id })}
                >
                  <span>
                    {t.title}
                    <small>
                      {t.complete
                        ? "Complete"
                        : `${t.owner} · due ${formatDate(t.due)}`}
                    </small>
                  </span>
                  <ArrowUpRight size={14} />
                </button>
              ))}
          </>
        )}
        {a && (
          <>
            <div className="record-facts">
              <span>
                Stage age<strong>{stageAge(a, d.now)} hours</strong>
              </span>
              <span>
                Entered stage<strong>{formatDate(a.stageEntered)}</strong>
              </span>
            </div>
            <label className="inspector-field">
              Application stage
              <select
                aria-label="Application stage"
                value={a.stage}
                onChange={(e) => {
                  const st = e.target.value as ApplicationStage;
                  if (st === "Offer" || st === "Accepted") setConfirmStage(st);
                  else s.moveApplicant(a.id, st);
                }}
              >
                {APPLICATION_STAGES.map((st) => (
                  <option key={st}>{st}</option>
                ))}
              </select>
            </label>
            <div className="checklist">
              <label>
                <input
                  type="checkbox"
                  checked={a.complete}
                  onChange={(e) =>
                    s.updateApplicant(a.id, "complete", e.target.checked)
                  }
                />
                <span>Application information complete</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={a.feedback}
                  onChange={(e) =>
                    s.updateApplicant(a.id, "feedback", e.target.checked)
                  }
                />
                <span>Reviewer feedback received</span>
              </label>
            </div>
            <div className="boundary-note">
              This is a coordination record. Offer and acceptance changes must
              reflect decisions already made by responsible reviewers. No
              automated candidate scoring.
            </div>
          </>
        )}
        {t && (
          <>
            <p>
              {t.priority} priority · {t.stage}
            </p>
            <div className="record-facts">
              <span>
                Due<strong>{formatDate(t.due)}</strong>
              </span>
              <span>
                Status<strong>{t.complete ? "Complete" : "Open"}</strong>
              </span>
            </div>
            <button
              className="button primary full"
              onClick={() => s.completeTask(t.id)}
            >
              <Check size={16} />
              {t.complete ? "Reopen task" : "Mark task complete"}
            </button>
          </>
        )}
        {support && (
          <>
            <Tag
              tone={
                support.resolved
                  ? "good"
                  : needsHuman(support.category)
                    ? "warning"
                    : "neutral"
              }
            >
              {support.resolved
                ? "Resolved"
                : needsHuman(support.category)
                  ? "Human handling required"
                  : "Open request"}
            </Tag>
            <p className="record-description">{support.detail}</p>
            <div className="record-facts">
              <span>
                Category<strong>{support.category}</strong>
              </span>
              <span>
                Opened<strong>{formatDate(support.opened)}</strong>
              </span>
            </div>
            {needsHuman(support.category) && (
              <div className="boundary-note">
                Route this request to the responsible human. Do not enter
                sensitive case details or provide legal advice. Closure requires
                confirmation of human follow-up.
              </div>
            )}
            <button
              disabled={support.resolved}
              className="button primary full"
              onClick={() =>
                needsHuman(support.category)
                  ? setConfirmSupport(true)
                  : s.resolveSupport(support.id)
              }
            >
              <Check size={15} />
              {support.resolved
                ? "Request resolved"
                : "Resolve support request"}
            </button>
          </>
        )}
        {event && (
          <>
            <div className="record-facts">
              <span>
                Date<strong>{formatDate(event.start)}</strong>
              </span>
              <span>
                Time
                <strong>
                  {formatTime(event.start)}–{formatTime(event.end)}
                </strong>
              </span>
            </div>
            <label className="inspector-field">
              Assigned room
              <select
                aria-label="Assigned room"
                value={event.roomId}
                onChange={(e) => s.moveRoom(event.id, e.target.value)}
              >
                {d.rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} · {r.capacity} places
                  </option>
                ))}
              </select>
            </label>
            <p className="field-help">
              Changing rooms recalculates conflicts immediately. Overlapping
              bookings are rejected; check attendee capacity separately before
              confirming.
            </p>
          </>
        )}
        {risk && (
          <>
            <Tag tone={risk.acknowledged ? "good" : "warning"}>
              {risk.acknowledged ? "Acknowledged" : "Review required"}
            </Tag>
            <p className="record-description">{risk.detail}</p>
            <button
              className="button primary full"
              disabled={risk.acknowledged}
              onClick={() => s.acknowledgeRisk(risk.id)}
            >
              {risk.acknowledged
                ? "Review acknowledged"
                : "Acknowledge after review"}
            </button>
            <p className="field-help">
              Acknowledging records ownership of the risk. It does not imply the
              underlying risk is resolved.
            </p>
          </>
        )}
        <div className="inspector-divider" />
        <h3>Coordinate the next step</h3>
        <button
          className="button full"
          onClick={() => s.queueReminder(selection)}
        >
          <Send size={14} />
          Queue reminder draft
        </button>
        <p className="field-help">
          Deterministic template · review before sending · no message sent
        </p>
        <label className="inspector-field">
          Operator note
          <textarea
            aria-label="Operator note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add context or name the next step. No sensitive personal information."
            maxLength={1000}
          />
        </label>
        <button
          className="button"
          disabled={!note.trim()}
          onClick={() => {
            s.addNote(selection, note);
            setNote("");
          }}
        >
          <FileText size={14} />
          Add note
        </button>
        <div className="inspector-divider" />
        <h3>Activity & audit trail</h3>
        <div className="audit-list">
          {audit.length ? (
            audit.map((e) => (
              <div key={e.id}>
                <span className="audit-dot" />
                <strong>{e.action}</strong>
                <small>
                  {formatDate(e.at)} · {formatTime(e.at)} · {e.actor}
                </small>
                {e.detail && <p>{e.detail}</p>}
              </div>
            ))
          ) : (
            <p className="field-help">
              Synthetic record seeded. Your changes will be recorded here.
            </p>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmSupport}
        onOpenChange={setConfirmSupport}
        title="Confirm human follow-up"
        description="Close this request only after a responsible human has handled it and agreed that no follow-up is outstanding. Do not record sensitive details here."
        confirmLabel="Human follow-up complete"
        onConfirm={() => support && s.resolveSupport(support.id, true)}
      />
      <ConfirmDialog
        open={!!confirmStage}
        onOpenChange={(open) => {
          if (!open) setConfirmStage(null);
        }}
        title="Record the reviewer decision"
        description="Confirm the responsible reviewer has made this admissions decision. CohortOps records the stage; it does not select candidates."
        confirmLabel="Confirm reviewer decision"
        onConfirm={() => {
          if (a && confirmStage) s.moveApplicant(a.id, confirmStage);
        }}
      />
    </>
  );
}
