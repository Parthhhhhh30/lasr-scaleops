import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ browserHealth: void }>({
  browserHealth: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await use();
      expect(
        errors,
        "No uncaught exceptions or browser console errors",
      ).toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };
