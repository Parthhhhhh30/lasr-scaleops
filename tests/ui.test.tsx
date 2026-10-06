import { beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Workspace } from "@/components/Workspace";
import { useOpsStore } from "@/store/useOpsStore";
import { createSeed } from "@/data/seed";
beforeEach(() => {
  localStorage.clear();
  useOpsStore.setState({
    data: createSeed(),
    cohortId: "winter",
    view: "control",
    selection: null,
    query: "",
    stage: null,
    filter: "all",
    hydrated: true,
    toast: "",
    storageNotice: "",
  });
  Element.prototype.scrollIntoView = vi.fn();
});
describe("connected operator workspaces", () => {
  it("switches the entire cohort context and filters the attention queue through lifecycle", () => {
    render(<Workspace />);
    fireEvent.change(screen.getByLabelText("Cohort"), {
      target: { value: "summer" },
    });
    expect(screen.getByText("5 participants")).toBeInTheDocument();
    fireEvent.click(
      within(screen.getByLabelText("Programme lifecycle")).getByRole("button", {
        name: /01 Recruit/,
      }),
    );
    expect(screen.getByText("Lifecycle: Recruit")).toBeInTheDocument();
    expect(screen.queryByText("Room booking overlap")).not.toBeInTheDocument();
  });
  it("searches applicants and changes their stage in the inspector", () => {
    useOpsStore.getState().setView("admissions");
    render(<Workspace />);
    fireEvent.change(screen.getByLabelText("Search applicants…"), {
      target: { value: "Amara" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Amara Okafor Evaluation/ }),
    );
    fireEvent.change(screen.getByLabelText("Application stage"), {
      target: { value: "Interview" },
    });
    expect(useOpsStore.getState().data.applicants[4].stage).toBe("Interview");
    expect(screen.getByText("0 hours")).toBeInTheDocument();
  });
  it("completes participant checklist items with live readiness and audit feedback", () => {
    useOpsStore.getState().setView("participants");
    render(<Workspace />);
    fireEvent.click(
      screen.getByRole("button", { name: /Maya Chen Evaluation/ }),
    );
    fireEvent.click(screen.getByLabelText(/Identity document received/));
    expect(
      screen.getByLabelText("Maya Chen checklist readiness"),
    ).toHaveAttribute("aria-valuenow", "40");
    expect(
      screen.getAllByText("Identity document received completed").length,
    ).toBeGreaterThan(0);
  });
  it("resolves access support and recomputes the brief", () => {
    useOpsStore.getState().select({ kind: "support", id: "winter-s1" });
    render(<Workspace />);
    fireEvent.click(
      screen.getByRole("button", { name: "Resolve support request" }),
    );
    expect(
      screen.getByRole("button", { name: "Request resolved" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Close inspector" }));
    fireEvent.click(screen.getByRole("button", { name: "Operations Brief" }));
    expect(
      screen.getByText(/2 support requests remain open/),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Support request resolved after operator review")
        .length,
    ).toBeGreaterThan(0);
  });
  it("executes a real command with keyboard navigation and Enter", () => {
    render(<Workspace />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "room conflicts" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(useOpsStore.getState().filter).toBe("logistics");
    expect(screen.getByText("Room booking overlap")).toBeInTheDocument();
    expect(
      screen.queryByText("Maya Chen · document check-in"),
    ).not.toBeInTheDocument();
  });
  it("requires confirmation before recording an offer decision", () => {
    useOpsStore.getState().setView("admissions");
    useOpsStore.getState().select({ kind: "applicant", id: "winter-a4" });
    render(<Workspace />);
    fireEvent.change(screen.getByLabelText("Application stage"), {
      target: { value: "Offer" },
    });
    expect(useOpsStore.getState().data.applicants[4].stage).toBe(
      "Initial screen",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm reviewer decision" }),
    );
    expect(useOpsStore.getState().data.applicants[4].stage).toBe("Offer");
  });
});
