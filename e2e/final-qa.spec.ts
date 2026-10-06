import { test, expect } from "./fixtures";

test("filters, milestones, invalid bookings and owned actions retain operational meaning", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await expect(page.locator(".queue-row")).toHaveCount(5);
  await page.getByLabel("Search attention queue…").fill("Maya");
  await expect(page.locator(".queue-row")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page
    .locator(".timeline")
    .getByRole("button", { name: /Document check-in/ })
    .click();
  await expect(page.locator(".active-filter")).toContainText("Visa");
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByRole("button", { name: /Room booking overlap/ }).click();
  await page.getByLabel("Assigned room").selectOption("seminar");
  await page.getByLabel("Assigned room").selectOption("studio");
  await expect(page.getByRole("status")).toContainText("already booked");
  await expect(page.getByLabel("Assigned room")).toHaveValue("seminar");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: /Confirm arrival details with Maya/ })
    .click();
  await page.getByLabel("Assign owner").selectOption("Demo operator");
  await page
    .getByRole("button", { name: "Mark task complete", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page
      .locator(".work-queue")
      .getByRole("button", { name: /Confirm arrival details with Maya/ }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: /Arrival coordination has no backup owner/ })
    .click();
  await page.getByRole("button", { name: "Acknowledge after review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Review acknowledged" }),
  ).toBeDisabled();
});

test("table filters, batch review safeguards, support links and current clipboard export work", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Admissions Flow", exact: true })
    .click();
  await page.getByRole("button", { name: /^Initial screen/ }).click();
  await page.getByLabel("Filter reviewer").selectOption("Alex Turner");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page.getByRole("button", { name: "Longest wait", exact: true }).click();
  await expect(page.locator("tbody tr").first()).toContainText("Amara Okafor");
  await page.getByLabel("Select all visible applicants").check();
  await page.getByLabel("Batch destination").selectOption("Offer");
  await page.getByRole("button", { name: "Move selected" }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page.getByRole("button", { name: "Move selected" }).click();
  await page.getByRole("button", { name: "Confirm reviewer decision" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Participant Ops", exact: true })
    .click();
  await page.getByLabel("Filter readiness").selectOption("ready");
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await page.getByRole("button", { name: /^Support requests/ }).click();
  await page
    .getByRole("button", { name: /Travel documentation question/ })
    .click();
  await page.getByRole("button", { name: "Maya Chen", exact: true }).click();
  await expect(page.getByLabel("Maya Chen checklist readiness")).toBeVisible();
  await page
    .locator(".inspector-linked")
    .filter({ hasText: "Travel documentation question" })
    .click();
  await page.getByRole("button", { name: "Resolve support request" }).click();
  await page
    .getByRole("button", { name: "Human follow-up complete", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Request resolved", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Operations Brief", exact: true })
    .click();
  await page.getByRole("button", { name: "Copy briefing text" }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Amara Okafor moved to Offer");
  expect(copied).toContain("Support request resolved after operator review");
  expect(copied).toContain("Synthetic demonstration data");
  await page
    .locator(".brief-action")
    .filter({ hasText: "confidential welfare conversation" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Request for a confidential welfare conversation",
    }),
  ).toBeVisible();
});
