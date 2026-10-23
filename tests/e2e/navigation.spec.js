import { test, expect } from './fixtures.js';

const SECTIONS = ['dashboard', 'expenses', 'budget', 'transfer', 'profile'];

test.describe('Layout and navigation', () => {
  test('each sidebar link opens its page and is highlighted @smoke', async ({ signedIn, page }) => {
    for (const s of SECTIONS) {
      await signedIn.tid(`nav-${s}`).click();
      await expect(page).toHaveURL(new RegExp(`/app/${s}$`));
      await expect(signedIn.tid(`page-${s}`)).toBeVisible();
      await expect(signedIn.tid(`nav-${s}`)).toHaveClass(/\bactive\b/);
    }
  });

  test('sidebar collapses, stays collapsed across pages, and expands again', async ({ signedIn, page }) => {
    const side = page.locator('.z-side');
    await signedIn.tid('sidebar-toggle').click();
    await expect(side).toHaveClass(/is-collapsed/);
    await signedIn.go('budget');
    await expect(side).toHaveClass(/is-collapsed/);
    await signedIn.tid('sidebar-toggle').click();
    await expect(side).not.toHaveClass(/is-collapsed/);
  });

  test('collapsed sidebar shows a tooltip on hover', async ({ signedIn, page }) => {
    await signedIn.tid('sidebar-toggle').click();
    const link = signedIn.tid('nav-budget');
    await expect(link).toHaveAttribute('data-label', 'Budget');
    await link.hover();
    await expect.poll(() => link.evaluate((el) => getComputedStyle(el, '::after').opacity)).toBe('1');
  });

  test('top bar "Add expense" opens Expenses with the form focused', async ({ signedIn }) => {
    await signedIn.tid('top-add-expense').click();
    await expect(signedIn.tid('page-expenses')).toBeVisible();
    await expect(signedIn.tid('expense-description')).toBeFocused();
  });

  test('top bar avatar opens Settings', async ({ signedIn }) => {
    await signedIn.tid('top-profile').click();
    await expect(signedIn.tid('page-profile')).toBeVisible();
  });

  test('sign out returns to sign-in and app pages are no longer reachable @smoke', async ({ signedIn, page }) => {
    await signedIn.signOut();
    await page.evaluate(() => { window.history.pushState({}, '', '/app/dashboard'); window.dispatchEvent(new PopStateEvent('popstate')); });
    await expect(page).toHaveURL(/\/app\/login$/);
  });
});
