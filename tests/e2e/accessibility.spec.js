import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures.js';

const scan = (page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
const summary = (violations) => violations.map((v) => `${v.id}: ${v.nodes.length} element(s), e.g. ${v.nodes[0]?.target.join(' ')}`).join('\n');

test.describe('Accessibility (axe, WCAG 2.1 AA)', () => {
  // Scan the settled page, not mid fade-in
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('landing page', async ({ page }) => {
    await page.goto('/');
    const { violations } = await scan(page);
    expect(violations, summary(violations)).toEqual([]);
  });

  for (const screen of ['login', 'register']) {
    test(`${screen} screen`, async ({ page }) => {
      await page.goto(`/app/${screen}`);
      const { violations } = await scan(page);
      expect(violations, summary(violations)).toEqual([]);
    });
  }

  for (const theme of ['dark', 'light']) {
    for (const section of ['dashboard', 'expenses', 'budget', 'transfer', 'profile']) {
      test(`${section} in ${theme} mode`, async ({ signedIn }) => {
        if ((await signedIn.theme()) !== theme) await signedIn.tid('theme-toggle').click();
        await signedIn.go(section);
        if (section === 'expenses') await signedIn.addExpense({ desc: 'Lunch', amount: 3500 });
        const { violations } = await scan(signedIn.page);
        expect(violations, summary(violations)).toEqual([]);
      });
    }
  }
});

test.describe('Keyboard only', () => {
  test('sign in, add an expense and make a transfer without a mouse', async ({ app, page }) => {
    await app.openLogin();
    await app.tid('email-input').focus();
    await page.keyboard.type('demo@zary.app');
    await page.keyboard.press('Tab');
    await page.keyboard.type('demo123');
    await page.keyboard.press('Enter');
    const code = await app.readCode();
    await expect(app.tid('otp-digit-1')).toBeFocused();
    await page.keyboard.type(code);
    await expect(app.tid('page-dashboard')).toBeVisible();

    await app.tid('nav-expenses').focus();
    await page.keyboard.press('Enter');
    await app.tid('expense-description').focus();
    await page.keyboard.type('Keyboard lunch');
    await page.keyboard.press('Tab');
    await page.keyboard.type('2500');
    await page.keyboard.press('Enter');
    await expect(app.expenseRows()).toHaveCount(1);

    await app.tid('nav-transfer').focus();
    await page.keyboard.press('Enter');
    await app.tid('transfer-amount').focus();
    await page.keyboard.type('1000');
    await page.keyboard.press('Enter');
    await expect(app.tid('main-balance')).toHaveText('XOF 939,000');
  });
});
