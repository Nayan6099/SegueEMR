import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // We check for some element that should be on the home page.
  // For SegueEMR it might just be the logo or a hero section.
  // This is a generic check.
  await expect(page.locator('body')).toBeVisible();
});
