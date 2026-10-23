/*
 * TRAINING SUITE: these tests fail on purpose.
 * Run them, read the error, open the video and trace, find the cause, then fix the test.
 * Each test is numbered to match tests/training/README.md.
 */
import { test, expect } from '../e2e/fixtures.js';

test.describe('Training: find and fix the failure', () => {
  test('01 starting balance is shown on Overview', async ({ signedIn }) => {
    await expect(signedIn.tid('total-balance')).toHaveText('XOF 1,250,000');
  });

  test('02 user can sign in with the demo account', async ({ app }) => {
    await app.openLogin();
    await app.tid('email-input').fill('demo@zary.app');
    await app.tid('password-input').fill('demo123');
    await app.tid('login-buton').click();
    await expect(app.tid('otp-display')).toBeVisible();
  });

  test('03 user can open the expense form from Overview', async ({ signedIn, page }) => {
    await page.getByRole('link', { name: 'Add expense' }).click();
    await expect(signedIn.tid('page-expenses')).toBeVisible();
  });

  test('04 the confirmation message disappears after a second', async ({ signedIn, page }) => {
    await page.clock.install();
    await signedIn.go('transfer');
    await signedIn.transfer(10000);
    await expect(signedIn.toast()).toBeVisible();
    await page.clock.runFor(1000);
    await expect(signedIn.toast()).toBeHidden({ timeout: 1000 });
  });

  test('05 spending 75% of a budget is flagged as over budget', async ({ signedIn }) => {
    await signedIn.go('expenses');
    await signedIn.addExpense({ desc: 'Market', amount: 60000, cat: 'Food' });
    await signedIn.go('budget');
    await expect(signedIn.tid('budget-food')).toContainText('Over budget');
  });

  test('06 the expense added earlier is still listed', async ({ signedIn, page }) => {
    await signedIn.go('expenses');
    await signedIn.addExpense({ desc: 'Water bill', amount: 8000, cat: 'Utilities' });
    await page.goto('/app/login');
    await signedIn.signIn();
    await signedIn.go('expenses');
    await expect(signedIn.expenseRows()).toHaveCount(1);
  });

  test('07 the expense counter updates after adding', async ({ signedIn }) => {
    await signedIn.go('expenses');
    const counter = await signedIn.tid('expense-count').textContent();
    await signedIn.addExpense({ desc: 'Bread', amount: 500 });
    expect(counter).toBe('1 entries');
  });

  test('08 every starting figure on Overview is correct', async ({ signedIn }) => {
    await expect.soft(signedIn.tid('total-balance')).toHaveText('XOF 1,240,000');
    await expect.soft(signedIn.tid('monthly-income')).toHaveText('XOF 500,000');
    await expect.soft(signedIn.tid('monthly-expenses')).toHaveText('XOF 0');
    await expect.soft(signedIn.tid('savings-rate')).toHaveText('40%');
  });

  test('09 the sidebar is visible on every screen size', async ({ signedIn, page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.z-side')).toBeVisible();
  });

  test('10 a transfer can be made right after signing in', async ({ signedIn }, testInfo) => {
    await signedIn.go('transfer');
    // Simulates an unstable environment: the first attempt hits a slow backend
    if (testInfo.retry === 0) await signedIn.page.waitForTimeout(31_000);
    await signedIn.transfer(5000);
    await expect(signedIn.tid('main-balance')).toHaveText('XOF 935,000');
  });
});

test.describe('Training: tests that are marked, not broken', () => {
  test('11 known issue: overspending should show a negative savings rate', async ({ signedIn }) => {
    test.fail(true, 'Known issue ZARY-12: kept as documentation until the product decision is made');
    await signedIn.go('expenses');
    await signedIn.addExpense({ desc: 'Car repair', amount: 500000, cat: 'Other' });
    await signedIn.go('dashboard');
    await expect(signedIn.tid('savings-rate')).toHaveText('-11%');
  });

  test.fixme('12 not written yet: export filters only the visible expenses', async () => {});
});
