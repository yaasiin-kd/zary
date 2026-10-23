import { test, expect } from './fixtures.js';

test.describe('Budget', () => {
  test('spending updates the category amount, percentage and bar @smoke', async ({ signedIn }) => {
    await signedIn.go('expenses');
    await signedIn.addExpense({ desc: 'Groceries', amount: 20000, cat: 'Food' });
    await signedIn.go('budget');
    const food = signedIn.tid('budget-food');
    await expect(food).toContainText('20,000');
    await expect(signedIn.tid('budget-pct-food')).toHaveText('25% used');
    await expect(food.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  for (const [amount, label, pct] of [[59000, 'On track', '73%'], [60000, 'Close to limit', '75%'], [79999, 'Close to limit', '99%'], [80000, 'Over budget', '100%']]) {
    test(`status for ${amount} of 80,000 is "${label}"`, async ({ signedIn }) => {
      await signedIn.go('expenses');
      await signedIn.addExpense({ desc: 'Food shop', amount, cat: 'Food' });
      await signedIn.go('budget');
      await expect(signedIn.tid('budget-food')).toContainText(label);
      await expect(signedIn.tid('budget-pct-food')).toHaveText(`${pct} used`);
    });
  }

  test('edit a limit and the percentage recalculates', async ({ signedIn }) => {
    await signedIn.go('expenses');
    await signedIn.addExpense({ desc: 'Market', amount: 36000, cat: 'Food' });
    await signedIn.go('budget');
    await expect(signedIn.tid('budget-pct-food')).toHaveText('45% used');
    await signedIn.tid('budget-edit-food').click();
    await signedIn.tid('budget-limit-food').fill('40000');
    await signedIn.tid('budget-save-food').click();
    await expect(signedIn.tid('budget-pct-food')).toHaveText('90% used');
    await expect(signedIn.tid('budget-food')).toContainText('Close to limit');
    await expect(signedIn.toast()).toContainText('Food budget updated');
  });

  test('cancel keeps the old limit', async ({ signedIn }) => {
    await signedIn.go('budget');
    await signedIn.tid('budget-edit-food').click();
    await signedIn.tid('budget-limit-food').fill('1');
    await signedIn.tid('budget-food').getByRole('button', { name: 'Cancel' }).click();
    await expect(signedIn.tid('budget-food')).toContainText('of XOF 80,000');
  });

  test('a limit of 0 is rejected', async ({ signedIn }) => {
    await signedIn.go('budget');
    await signedIn.tid('budget-edit-food').click();
    await signedIn.tid('budget-limit-food').fill('0');
    await signedIn.tid('budget-save-food').click();
    await expect(signedIn.tid('budget-food')).toContainText('Enter a limit greater than 0.');
  });

  test('summary shows totals and counts', async ({ signedIn }) => {
    await signedIn.go('expenses');
    await signedIn.addExpenses([{ desc: 'Bus pass', amount: 32000, cat: 'Transport' }, { desc: 'Concert', amount: 30000, cat: 'Entertainment' }]);
    await signedIn.go('budget');
    await expect(signedIn.tid('budget-total')).toContainText('XOF 62,000');
    await expect(signedIn.tid('budget-total')).toContainText('of XOF 245,000');
    await expect(signedIn.tid('budget-remaining')).toHaveText('183,000');
    await expect(signedIn.tid('budget-close-count')).toHaveText('1');
    await expect(signedIn.tid('budget-over-count')).toHaveText('1');
  });

  test('"left" turns into "over" past the limit', async ({ signedIn }) => {
    await signedIn.go('expenses');
    await signedIn.addExpense({ desc: 'Gym', amount: 55000, cat: 'Health' });
    await signedIn.go('budget');
    await expect(signedIn.tid('budget-left-health')).toHaveText('XOF 5,000 over');
    await expect(signedIn.tid('budget-left-food')).toHaveText('XOF 80,000 left');
  });
});
