import fs from 'node:fs/promises';
import { test, expect } from './fixtures.js';

test.describe('Expenses', () => {
  test.beforeEach(async ({ signedIn }) => { await signedIn.go('expenses'); });

  test('add an expense @smoke', async ({ signedIn }) => {
    await expect(signedIn.tid('empty-expenses')).toContainText('No expenses yet');
    await signedIn.addExpense({ desc: 'Lunch at the market', amount: 3500, cat: 'Food' });
    await expect(signedIn.expenseRows()).toHaveCount(1);
    await expect(signedIn.expenseRows().first()).toContainText('Lunch at the market');
    await expect(signedIn.expenseRows().first()).toContainText('3,500');
    await expect(signedIn.tid('expense-count')).toHaveText('1 entries');
    await expect(signedIn.toast()).toContainText('Expense added');
  });

  test('delete an expense @smoke', async ({ signedIn }) => {
    await signedIn.addExpense({ desc: 'Taxi', amount: 2000, cat: 'Transport' });
    await signedIn.expenseRows().first().getByRole('button', { name: 'Remove Taxi' }).click();
    await expect(signedIn.expenseRows()).toHaveCount(0);
    await expect(signedIn.toast()).toContainText('Expense removed');
  });

  test('field errors for empty description and invalid amount, cleared while typing', async ({ signedIn }) => {
    await signedIn.tid('add-expense-button').click();
    await expect(signedIn.tid('expense-description-error')).toHaveText('Add a short description.');
    await expect(signedIn.tid('expense-amount-error')).toHaveText('Enter an amount greater than 0.');
    await expect(signedIn.tid('expense-description')).toBeFocused();
    await signedIn.tid('expense-description').fill('Water bill');
    await expect(signedIn.tid('expense-description-error')).toBeHidden();
    await signedIn.tid('expense-amount').fill('-50');
    await signedIn.tid('add-expense-button').click();
    await expect(signedIn.tid('expense-amount-error')).toBeVisible();
    await expect(signedIn.expenseRows()).toHaveCount(0);
  });

  test('undo after adding removes the expense', async ({ signedIn }) => {
    await signedIn.addExpense({ desc: 'Mistake', amount: 999 });
    await signedIn.tid('undo-button').click();
    await expect(signedIn.expenseRows()).toHaveCount(0);
    await expect(signedIn.toast()).toContainText('Action undone');
  });

  test('undo after deleting restores the expense', async ({ signedIn }) => {
    await signedIn.addExpense({ desc: 'Keep me', amount: 1500 });
    await signedIn.expenseRows().first().getByRole('button', { name: 'Remove Keep me' }).click();
    await signedIn.tid('undo-button').click();
    await expect(signedIn.expenseRows()).toHaveCount(1);
    await expect(signedIn.expenseRows().first()).toContainText('Keep me');
  });

  test('undo is no longer offered after 4 seconds', async ({ signedIn, page }) => {
    await page.clock.install();
    await signedIn.addExpense({ desc: 'Too late', amount: 700 });
    await expect(signedIn.tid('undo-button')).toBeVisible();
    await page.clock.runFor(4100);
    await expect(signedIn.tid('undo-button')).toBeHidden();
  });

  test('monthly switch adds the Monthly badge', async ({ signedIn }) => {
    await signedIn.addExpense({ desc: 'Internet', amount: 15000, cat: 'Utilities', monthly: true });
    await expect(signedIn.expenseRows().first()).toContainText('Monthly');
    await expect(signedIn.tid('expense-recurring')).not.toBeChecked();
  });

  test.describe('with several expenses', () => {
    test.beforeEach(async ({ signedIn }) => {
      const list = Array.from({ length: 9 }, (_, i) => ({ desc: `Item ${i + 1}`, amount: (i + 1) * 1000, cat: i % 2 ? 'Transport' : 'Food' }));
      await signedIn.addExpenses(list);
      await expect(signedIn.tid('expense-count')).toHaveText('9 entries');
    });

    test('newest expense is listed first', async ({ signedIn }) => {
      await expect(signedIn.expenseRows().first()).toContainText('Item 9');
    });

    test('pagination splits 9 expenses over 2 pages', async ({ signedIn }) => {
      await expect(signedIn.tid('pagination-info')).toHaveText('Showing 1–8 of 9');
      await expect(signedIn.tid('pagination-prev')).toBeDisabled();
      await signedIn.tid('pagination-next').click();
      await expect(signedIn.tid('pagination-info')).toHaveText('Showing 9–9 of 9');
      await expect(signedIn.tid('pagination-next')).toBeDisabled();
      await signedIn.tid('pagination-page-1').click();
      await expect(signedIn.tid('pagination-info')).toHaveText('Showing 1–8 of 9');
    });

    test('search by description returns to page 1', async ({ signedIn }) => {
      await signedIn.tid('pagination-next').click();
      await signedIn.tid('search-expenses').fill('Item 3');
      await expect(signedIn.tid('expense-count')).toHaveText('1 entries');
      await expect(signedIn.tid('pagination-info')).toHaveText('Showing 1–1 of 1');
    });

    test('search by category name', async ({ signedIn }) => {
      await signedIn.tid('search-expenses').fill('transport');
      await expect(signedIn.tid('expense-count')).toHaveText('4 entries');
    });

    test('category filter, alone and combined with search', async ({ signedIn }) => {
      await signedIn.tid('filter-category').selectOption('Food');
      await expect(signedIn.tid('expense-count')).toHaveText('5 entries');
      await signedIn.tid('search-expenses').fill('Item 9');
      await expect(signedIn.tid('expense-count')).toHaveText('1 entries');
    });

    test('no results state and "Clear filters"', async ({ signedIn }) => {
      await signedIn.tid('search-expenses').fill('zzz');
      await expect(signedIn.tid('empty-expenses')).toContainText('No matching expenses');
      await signedIn.tid('clear-filters').click();
      await expect(signedIn.tid('search-expenses')).toHaveValue('');
      await expect(signedIn.tid('expense-count')).toHaveText('9 entries');
    });
  });

  test('CSV export downloads every expense', async ({ signedIn, page }) => {
    await signedIn.addExpenses([{ desc: 'Lunch', amount: 3500 }, { desc: 'Bus', amount: 500, cat: 'Transport', monthly: true }]);
    const [download] = await Promise.all([page.waitForEvent('download'), signedIn.tid('export-csv').click()]);
    expect(download.suggestedFilename()).toBe('zary-expenses.csv');
    const lines = (await fs.readFile(await download.path(), 'utf8')).trim().split('\n');
    expect(lines[0]).toBe('ID,Description,Category,Recurring,Amount (XOF),Date');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('"Lunch",Food,No,3500');
    expect(lines[2]).toContain('"Bus",Transport,Yes,500');
  });

  test('CSV export with no expenses shows a message instead', async ({ signedIn }) => {
    await signedIn.tid('export-csv').click();
    await expect(signedIn.toast()).toContainText('No expenses to export');
  });

  test('quotes in a description are escaped in the CSV', async ({ signedIn, page }) => {
    await signedIn.addExpense({ desc: 'Gift for "Mama"', amount: 10000, cat: 'Other' });
    const [download] = await Promise.all([page.waitForEvent('download'), signedIn.tid('export-csv').click()]);
    expect(await fs.readFile(await download.path(), 'utf8')).toContain('"Gift for ""Mama"""');
  });

  test('description is limited to 60 characters', async ({ signedIn }) => {
    await signedIn.tid('expense-description').fill('x'.repeat(80));
    await expect(signedIn.tid('expense-description')).toHaveValue('x'.repeat(60));
  });
});
