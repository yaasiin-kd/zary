import { test, expect } from './fixtures.js';

test.describe('Routing and access', () => {
  test('signed-out visit to /app goes to sign-in @smoke', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveURL(/\/app\/login$/);
  });

  for (const path of ['dashboard', 'expenses', 'budget', 'transfer', 'profile']) {
    test(`signed-out visit to /app/${path} goes to sign-in`, async ({ page }) => {
      await page.goto(`/app/${path}`);
      await expect(page).toHaveURL(/\/app\/login$/);
    });
  }

  for (const path of ['verify', 'welcome']) {
    test(`/app/${path} without signing in first goes to sign-in`, async ({ page }) => {
      await page.goto(`/app/${path}`);
      await expect(page).toHaveURL(/\/app\/login$/);
    });
  }

  test('signed-in user opening /app/login is sent to Overview', async ({ signedIn, page }) => {
    await signedIn.tid('nav-expenses').click();
    await page.evaluate(() => { window.history.pushState({}, '', '/app/login'); window.dispatchEvent(new PopStateEvent('popstate')); });
    await expect(page).toHaveURL(/\/app\/dashboard$/);
  });

  test('unknown top-level route goes to the landing page', async ({ page }) => {
    await page.goto('/does-not-exist');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Know where every franc goes.');
  });

  test('unknown app route goes to sign-in when signed out', async ({ page }) => {
    await page.goto('/app/does-not-exist');
    await expect(page).toHaveURL(/\/app\/login$/);
  });

  test('refreshing an app page signs the user out (data is kept in memory)', async ({ signedIn, page }) => {
    await page.reload();
    await expect(page).toHaveURL(/\/app\/login$/);
  });
});
