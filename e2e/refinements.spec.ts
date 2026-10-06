import { test, expect } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";

test("desktop inspector keeps selected context interactive, readable and scroll position intact", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Participant Ops", exact: true })
    .click();
  const row = page.getByRole("row").filter({ hasText: "Maya Chen" });
  await row.getByRole("button", { name: /Maya Chen Evaluation/ }).click();
  const inspector = page.getByRole("region", {
    name: "Record inspector",
    exact: true,
  });
  await expect(inspector).toBeVisible();
  await expect(page.locator(".inspector-overlay")).toHaveCount(0);
  await expect(row).toHaveClass(/record-selected/);
  const widths = await page.evaluate(() => ({
    workspace: document.querySelector(".main-shell")!.getBoundingClientRect()
      .width,
    inspector: document.querySelector(".inspector")!.getBoundingClientRect()
      .width,
  }));
  expect(widths.inspector).toBeGreaterThanOrEqual(420);
  expect(widths.inspector).toBeLessThanOrEqual(480);
  await expect
    .poll(() =>
      page
        .locator(".main-shell")
        .evaluate((e) => e.getBoundingClientRect().right),
    )
    .toBeLessThanOrEqual(1001);
  await page.getByLabel("Search participants or support…").fill("Maya");
  await expect(inspector).toBeVisible();
  await expect(
    page.getByRole("row").filter({ hasText: "Elias Morgan" }),
  ).toHaveCount(0);
  await page.getByLabel("Search participants or support…").fill("");
  await page
    .getByRole("row")
    .filter({ hasText: "Elias Morgan" })
    .getByRole("button", { name: /Elias Morgan Interpretability/ })
    .click();
  await expect(
    inspector.getByRole("heading", { name: "Elias Morgan", exact: true }),
  ).toBeVisible();
  await expect(row).not.toHaveClass(/record-selected/);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(inspector).toHaveCount(0);
  await expect(page.locator(".record-selected")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Cohort Control", exact: true })
    .click();
  await page.locator(".work-queue").evaluate((e) => {
    e.scrollTop = 200;
  });
  const selected = page
    .locator(".queue-row")
    .filter({ hasText: "Jonas Berg · document check-in" });
  await selected.click();
  const scroll = await page.locator(".work-queue").evaluate((e) => e.scrollTop);
  await page.keyboard.press("Escape");
  expect(
    await page.locator(".work-queue").evaluate((e) => e.scrollTop),
  ).toBeCloseTo(scroll, 0);
});

test("board moves are direct and audited; offers still require human confirmation", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Admissions Flow", exact: true })
    .click();
  await page.getByRole("button", { name: "Board view" }).click();
  const move = page.getByLabel("Move Amara Okafor to stage");
  await move.selectOption("Interview");
  await expect(
    page
      .locator(".admissions-board>section")
      .filter({
        has: page.getByRole("heading", { name: "Interview", exact: true }),
      })
      .getByLabel("Move Amara Okafor to stage"),
  ).toHaveValue("Interview");
  await expect(
    page.locator(".applicant-ticket").filter({ hasText: "Amara Okafor" }),
  ).toContainText("0h");
  await move.selectOption("Offer");
  await expect(
    page.getByRole("heading", { name: "Record a human admissions decision" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(move).toHaveValue("Interview");
  await move.selectOption("Offer");
  await page.getByRole("button", { name: "Confirm reviewer decision" }).click();
  await expect(move).toHaveValue("Offer");
  await expect(move).toBeFocused();
  await move.selectOption("Accepted");
  await page.getByRole("button", { name: "Confirm reviewer decision" }).click();
  await expect(move).toHaveValue("Accepted");
  await expect(move).toBeFocused();
  await page
    .getByRole("button", { name: "Operations Brief", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Current Operations Brief" }),
  ).toBeVisible();
  await expect(
    page
      .locator(".brief-change")
      .getByText("Amara Okafor moved to Accepted", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Generate/ })).toHaveCount(0);
  await page.reload();
  await page
    .getByRole("button", { name: "Admissions Flow", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "Amara Okafor" }),
  ).toContainText("Accepted");
});

test("live brief command focuses the result and demo controls retain audit behavior", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("current operations brief");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Current Operations Brief" }),
  ).toBeVisible();
  await expect(page.locator("#workspace-surface")).toBeFocused();
  await page
    .getByRole("button", { name: "Demo controls", exact: true })
    .click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page
    .getByRole("button", { name: "Advance 3 days", exact: true })
    .click();
  await page.getByRole("button", { name: "Close demo controls" }).click();
  await expect(
    page
      .locator(".brief-change")
      .filter({ hasText: "Operational clock advanced by 3 days" }),
  ).toBeVisible();
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("Maya Chen");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Maya Chen checklist readiness")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close inspector" }),
  ).toBeFocused();
});

test("tablet inspector is a modal drawer and reduced-motion disables transitions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("button", { name: /Maya Chen · document check-in/ })
    .click();
  const drawer = page.getByRole("dialog", {
    name: "Record inspector",
    exact: true,
  });
  await expect(drawer).toBeVisible();
  await expect(page.locator(".inspector-overlay")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cohort Control", exact: true }),
  ).toHaveCount(0);
  expect(await drawer.evaluate((e) => getComputedStyle(e).animationName)).toBe(
    "none",
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
