import { test, expect } from './fixtures.js';

// Runs in the "mobile" project (Pixel 7 viewport)
test.describe('Phone layout', () => {
  test('sidebar is hidden and the bottom navigation works', async ({ signedIn, page }) => {
    await expect(page.locator('.z-side')).toBeHidden();
    await expect(page.locator('.z-bottom')).toBeVisible();
    for (const s of ['expenses', 'budget', 'transfer', 'profile', 'dashboard']) {
      await signedIn.tid(`bnav-${s}`).click();
      await expect(signedIn.tid(`page-${s}`)).toBeVisible();
      await expect(signedIn.tid(`bnav-${s}`)).toHaveClass(/\bactive\b/);
    }
  });

  test('top bar shows the logo and hides the date and quick add', async ({ signedIn, page }) => {
    await expect(page.locator('.z-top .z-brand')).toBeVisible();
    await expect(page.locator('.z-top-date')).toBeHidden();
    await expect(signedIn.tid('top-add-expense')).toBeHidden();
  });

  test('expense form and list stack and stay usable', async ({ signedIn }) => {
    await signedIn.tid('bnav-expenses').click();
    await signedIn.addExpense({ desc: 'Phone credit', amount: 2000, cat: 'Utilities' });
    await expect(signedIn.expenseRows()).toHaveCount(1);
  });

  test('page does not scroll sideways', async ({ signedIn, page }) => {
    for (const s of ['dashboard', 'expenses', 'budget', 'transfer', 'profile']) {
      await signedIn.tid(`bnav-${s}`).click();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${s} overflows horizontally`).toBeLessThanOrEqual(1);
    }
  });

  test('landing page works on a phone', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header nav.links')).toBeHidden();
    await page.getByTestId('hero-open-app').click();
    await expect(page).toHaveURL(/\/app\/login$/);
  });
});
