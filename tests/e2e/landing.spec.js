import { test, expect } from './fixtures.js';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('shows the main sections @smoke', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Know where every franc goes.');
    await expect(page.locator('.lp .feature')).toHaveCount(4);
    await expect(page.locator('#steps li')).toHaveCount(3);
    await expect(page.locator('.lp details')).toHaveCount(6);
    await expect(page.locator('footer')).toContainText('© 2026 Zary');
  });

  for (const id of ['nav-open-app', 'hero-open-app', 'cta-open-app']) {
    test(`"Open Zary" (${id}) leads to sign-in`, async ({ page }) => {
      await page.getByTestId(id).click();
      await expect(page).toHaveURL(/\/app\/login$/);
    });
  }

  test('"Open Zary" in the footer leads to sign-in', async ({ page }) => {
    await page.locator('footer').getByRole('link', { name: 'Open Zary' }).click();
    await expect(page).toHaveURL(/\/app\/login$/);
  });

  for (const [name, hash] of [['Features', '#features'], ['How it works', '#how'], ['Questions', '#faq']]) {
    test(`header link "${name}" scrolls to its section`, async ({ page }) => {
      await page.locator('header nav').getByRole('link', { name }).click();
      await expect(page).toHaveURL(new RegExp(`${hash}$`));
      await expect(page.locator(hash)).toBeInViewport();
    });
  }

  test('FAQ items expand and collapse', async ({ page }) => {
    const item = page.locator('.lp details').first();
    await item.locator('summary').click();
    await expect(item).toHaveAttribute('open', '');
    await item.locator('summary').click();
    await expect(item).not.toHaveAttribute('open', '');
  });

  test('demo credentials from the FAQ work', async ({ app, page }) => {
    const answer = page.locator('.lp details').last();
    await answer.locator('summary').click();
    const text = await answer.locator('p').textContent();
    const email = text.match(/\S+@\S+\.\w+/)[0];
    const password = text.match(/password (\S+?)\.?$/)[1];
    await app.openLogin();
    await app.submitLogin(email, password);
    await app.enterCode();
    await expect(app.tid('page-dashboard')).toBeVisible();
  });
});

test.describe('Landing page fallbacks', () => {
  test('shows the flat banknote when WebGL is not available', async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        return /webgl/.test(type) ? null : original.call(this, type, ...rest);
      };
    });
    await page.goto('/');
    await expect(page.locator('#hero-art')).not.toHaveClass(/\bgl\b/);
    await expect(page.locator('#hero-art .note')).toBeVisible();
  });

  test.describe('with reduced motion', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } });
    test('content shows in its final state', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#ledger [data-count="450000"]')).toHaveText('450\u202f000');
      await expect(page.locator('.alert-tag')).toHaveClass(/show/);
    });
  });
});
