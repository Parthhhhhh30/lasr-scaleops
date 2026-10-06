import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ArrowRight, ChevronDown, Clock3, RotateCcw, X } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import { formatDate } from "./ui";
export function DemoControls({ onReset }: { onReset: () => void }) {
  const s = useOpsStore(),
    [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className="demo-controls-trigger"
        aria-label="Demo controls"
      >
        <Clock3 size={14} />
        <span>Demo clock · {formatDate(s.data.now)}</span>
        <ChevronDown size={13} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="demo-controls-panel"
          sideOffset={8}
          align="end"
          aria-label="Demo controls"
        >
          <div className="demo-controls-heading">
            <h2>Demo controls</h2>
            <Popover.Close
              className="icon-button"
              aria-label="Close demo controls"
            >
              <X size={16} />
            </Popover.Close>
          </div>
          <p>
            Synthetic time only. Advance the clock to expose review SLAs and
            overdue actions. Each advance is audited.
          </p>
          <div className="demo-current-date">
            {formatDate(s.data.now)} {new Date(s.data.now).getFullYear()}{" "}
            <span>Current demonstration date</span>
          </div>
          <button className="button primary full" onClick={s.advanceTime}>
            Advance 3 days
            <ArrowRight size={15} />
          </button>
          <button
            className="button full"
            onClick={() => {
              setOpen(false);
              onReset();
            }}
          >
            <RotateCcw size={14} />
            Reset demo state
          </button>
          <p className="field-help">
            Reset restores all three cohorts and clears local edits after
            confirmation.
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
