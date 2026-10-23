import { test, expect } from './fixtures.js';

test.describe('Overview', () => {
  test('starting balances and figures @smoke', async ({ signedIn }) => {
    await expect(signedIn.tid('total-balance')).toHaveText('XOF 1,240,000');
    const card = signedIn.page.locator('.z-balance');
    await expect(card).toContainText('Main accountXOF 940,000');
    await expect(card).toContainText('SavingsXOF 300,000');
    await expect(signedIn.tid('monthly-income')).toHaveText('XOF 450,000');
    await expect(signedIn.tid('monthly-expenses')).toHaveText('XOF 0');
    await expect(signedIn.tid('savings-rate')).toHaveText('100%');
    await expect(signedIn.tid('budget-used')).toHaveText('0%');
  });

  test('expenses update spending, savings rate and budget used', async ({ signedIn }) => {
    await signedIn.go('expenses');
    await signedIn.addExpense({ desc: 'Rent share', amount: 45000, cat: 'Other' });
    await signedIn.go('dashboard');
    await expect(signedIn.tid('monthly-expenses')).toHaveText('XOF 45,000');
    await expect(signedIn.tid('savings-rate')).toHaveText('90%');
    await expect(signedIn.tid('budget-used')).toHaveText('15%');
    await expect(signedIn.page.getByText('On track')).toBeVisible();
  });

  test('savings goal badge switches to "Below goal" under 40%', async ({ signedIn }) => {
    await signedIn.go('expenses');
    await signedIn.addExpense({ desc: 'New laptop', amount: 300000, cat: 'Other' });
    await signedIn.go('dashboard');
    await expect(signedIn.tid('savings-rate')).toHaveText('33%');
    await expect(signedIn.page.getByText('Below goal')).toBeVisible();
  });

  test('recent activity shows newest first, includes transfers, at most 6 rows', async ({ signedIn }) => {
    const rows = signedIn.page.getByTestId('activity-row');
    await expect(rows).toHaveCount(3);
    await signedIn.go('expenses');
    await signedIn.addExpenses([{ desc: 'First item', amount: 1000 }, { desc: 'Second item', amount: 2000 }, { desc: 'Third item', amount: 3000 }]);
    await signedIn.go('transfer');
    await signedIn.transfer(5000, 'Rainy day');
    await expect(signedIn.tid('main-balance')).toHaveText('XOF 935,000');
    await signedIn.go('dashboard');
    await expect(rows).toHaveCount(6);
    await expect(rows.first()).toContainText('Rainy day');
    await expect(rows.first()).toContainText('Main to Savings');
    await expect(rows.nth(1)).toContainText('Third item');
  });

  test('budget health shows an empty state, then the busiest categories', async ({ signedIn }) => {
    await expect(signedIn.page.getByText('Nothing spent yet')).toBeVisible();
    await signedIn.go('expenses');
    await signedIn.addExpense({ desc: 'Bus pass', amount: 30000, cat: 'Transport' });
    await signedIn.go('dashboard');
    const health = signedIn.page.locator('.z-health-row');
    await expect(health).toHaveCount(4);
    await expect(health.first()).toContainText('Transport');
    await expect(health.first()).toContainText('30,000 of 40,000');
  });

  for (const [hour, word] of [[9, 'Good morning'], [15, 'Good afternoon'], [20, 'Good evening']]) {
    test(`greeting says "${word}" at ${hour}:00`, async ({ app, page }) => {
      await page.clock.setFixedTime(new Date(`2026-10-23T${String(hour).padStart(2, '0')}:00:00`));
      await app.signIn();
      await expect(page.locator('.z-page-head h1')).toHaveText(`${word}, Demo`);
    });
  }
});
