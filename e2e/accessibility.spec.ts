import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("workspaces and working dialogs have no WCAG A/AA violations detected by axe", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("12 participants", { exact: true }),
  ).toBeVisible();
  for (const label of [
    "Cohort Control",
    "Admissions Flow",
    "Participant Ops",
    "Operations Brief",
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations, `${label} accessibility`).toEqual([]);
  }
  await page
    .getByRole("button", { name: "Participant Ops", exact: true })
    .click();
  await page.getByRole("button", { name: /Maya Chen Evaluation/ }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("region", { name: "Record inspector", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Search & commands", exact: true })
    .click();
  await expect(page.getByRole("combobox")).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Search & commands", exact: true }),
  ).toBeFocused();
});
