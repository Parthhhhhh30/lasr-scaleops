import { test, expect } from "@playwright/test";
test("document check-in updates the queue, checklist and persistent weekly brief", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /Maya Chen · document check-in/ })
    .click();
  await expect(
    page.getByRole("progressbar", { name: "Maya Chen checklist readiness" }),
  ).toHaveAttribute("aria-valuenow", "20");
  for (const label of [
    "Identity document received",
    "Visa/admin information reviewed by coordinator",
    "Workspace access confirmed",
    "Orientation attendance confirmed",
  ])
    await page.getByRole("checkbox", { name: new RegExp(label) }).check();
  await expect(
    page.getByRole("progressbar", { name: "Maya Chen checklist readiness" }),
  ).toHaveAttribute("aria-valuenow", "100");
  await page.getByRole("button", { name: "Close inspector" }).click();
  await expect(
    page.getByRole("button", { name: /Maya Chen · document check-in/ }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Operations Brief", exact: true })
    .click();
  await expect(
    page
      .locator("#main")
      .getByText("Orientation attendance confirmed completed", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Participant Ops", exact: true })
    .click();
  await page.getByRole("button", { name: /Maya Chen Evaluation/ }).click();
  await expect(
    page.getByRole("progressbar", { name: "Maya Chen checklist readiness" }),
  ).toHaveAttribute("aria-valuenow", "100");
});
test("operator resolves room overlap, support and reviewer ageing with audited actions", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Room booking overlap/ }).click();
  await page.getByLabel("Assigned room").selectOption("seminar");
  await page.getByRole("button", { name: "Close inspector" }).click();
  await expect(page.getByText("No booking overlaps")).toBeVisible();
  await page
    .getByRole("button", { name: /Workspace access invitation missing/ })
    .click();
  await page.getByRole("button", { name: "Resolve support request" }).click();
  await page.getByRole("button", { name: "Close inspector" }).click();
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("applications waiting");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Admissions Flow." }),
  ).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: "Amara Okafor" });
  await row.getByRole("button", { name: /Amara Okafor Evaluation/ }).click();
  await page.getByLabel("Application stage").selectOption("Interview");
  await expect(page.getByText("0 hours")).toBeVisible();
  await page
    .getByLabel("Operator note")
    .fill("Reviewer has confirmed the next conversation.");
  await page.getByRole("button", { name: "Add note", exact: true }).click();
  await page.getByRole("button", { name: "Close inspector" }).click();
  await page
    .getByRole("button", { name: "Operations Brief", exact: true })
    .click();
  await expect(
    page.getByText(/0 room conflicts require coordination/),
  ).toBeVisible();
  await expect(
    page.getByText("Support request resolved after operator review", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Amara Okafor moved to Interview", { exact: true }),
  ).toBeVisible();
});
test("cohort, board, sensitive escalation and reset are real interactions", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Cohort", { exact: true }).selectOption("summer");
  await expect(page.getByText("5 participants", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Admissions Flow", exact: true })
    .click();
  await page.getByRole("button", { name: "Board view" }).click();
  await expect(page.locator(".admissions-board")).toBeVisible();
  await page.getByLabel("Cohort", { exact: true }).selectOption("winter");
  await page
    .getByRole("button", { name: "Cohort Control", exact: true })
    .click();
  await page
    .getByRole("button", { name: /Travel documentation question/ })
    .click();
  await page.getByRole("button", { name: "Resolve support request" }).click();
  await expect(
    page.getByRole("heading", { name: "Confirm human follow-up" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resolve support request" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Close inspector" }).click();
  await page.getByRole("button", { name: "Simulate +3 days" }).click();
  await page.getByRole("button", { name: "Reset demonstration" }).click();
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await expect(page.getByText("Demo clock · 11 Jan 2027")).toBeVisible();
});
test("mobile navigation and command palette remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("button", { name: "Participant Ops", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Participant Ops." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Search & commands" }).click();
  await page.getByRole("combobox").fill("weekly brief");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Operations Brief." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
