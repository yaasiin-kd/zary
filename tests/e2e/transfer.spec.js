import { test, expect } from './fixtures.js';

test.describe('Transfer', () => {
  test.beforeEach(async ({ signedIn }) => { await signedIn.go('transfer'); });

  test('Main to Savings moves the money @smoke', async ({ signedIn }) => {
    await signedIn.transfer(50000, 'Monthly savings');
    await expect(signedIn.tid('main-balance')).toHaveText('XOF 890,000');
    await expect(signedIn.tid('savings-balance')).toHaveText('XOF 350,000');
    await expect(signedIn.toast()).toContainText('Transfer successful');
    await signedIn.go('dashboard');
    await expect(signedIn.tid('total-balance')).toHaveText('XOF 1,240,000');
    await expect(signedIn.page.locator('.z-balance')).toContainText('SavingsXOF 350,000');
  });

  test('more than the main balance is refused', async ({ signedIn }) => {
    await signedIn.transfer(2000000);
    await expect(signedIn.tid('transfer-error')).toHaveText('Insufficient balance in Main Account.');
    await expect(signedIn.tid('main-balance')).toHaveText('XOF 940,000');
  });

  test('empty or zero amount is refused', async ({ signedIn }) => {
    await signedIn.tid('transfer-button').click();
    await expect(signedIn.tid('transfer-error')).toHaveText('Enter a valid amount.');
    await signedIn.transfer(0);
    await expect(signedIn.tid('transfer-error')).toHaveText('Enter a valid amount.');
  });

  test('swap direction: Savings to Main, checked against savings', async ({ signedIn }) => {
    await expect(signedIn.page.getByText('Available: XOF 940,000')).toBeVisible();
    await signedIn.tid('transfer-swap').click();
    await expect(signedIn.page.getByText('Available: XOF 300,000')).toBeVisible();
    await signedIn.transfer(400000);
    await expect(signedIn.tid('transfer-error')).toHaveText('Insufficient balance in Savings Account.');
    await signedIn.transfer(20000);
    await expect(signedIn.tid('main-balance')).toHaveText('XOF 960,000');
    await expect(signedIn.tid('savings-balance')).toHaveText('XOF 280,000');
    await expect(signedIn.page.locator('[data-testid^="transfer-row-"]').first()).toContainText('Savings to Main');
  });

  test('quick amounts fill the field and the button label', async ({ signedIn }) => {
    await signedIn.tid('transfer-quick-25000').click();
    await expect(signedIn.tid('transfer-amount')).toHaveValue('25000');
    await expect(signedIn.tid('transfer-quick-25000')).toHaveClass(/active/);
    await expect(signedIn.tid('transfer-button')).toHaveText('Transfer XOF 25,000');
  });

  test('history lists note, direction, date and status', async ({ signedIn }) => {
    await expect(signedIn.tid('empty-transfers')).toBeVisible();
    await signedIn.transfer(10000);
    await signedIn.transfer(5000, 'School fees');
    const rows = signedIn.page.locator('[data-testid^="transfer-row-"]');
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText('School fees');
    await expect(rows.nth(1)).toContainText('Transfer');
    await expect(rows.first()).toContainText('Main to Savings');
    await expect(rows.first()).toContainText('Completed');
    await expect(rows.first()).toContainText(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
  });
});
