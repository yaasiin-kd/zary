import { test, expect } from './fixtures.js';
import { DEMO } from './support/app.js';

test.describe('Settings: profile', () => {
  test.beforeEach(async ({ signedIn }) => { await signedIn.go('profile'); });

  test('save a new name everywhere @smoke', async ({ signedIn }) => {
    await signedIn.tid('profile-firstname').fill('Ama');
    await signedIn.tid('profile-lastname').fill('Koffi');
    await signedIn.tid('save-profile-button').click();
    await expect(signedIn.tid('profile-name-display')).toHaveText('Ama Koffi');
    await expect(signedIn.tid('user-name')).toHaveText('Ama');
    await expect(signedIn.toast()).toContainText('Profile saved');
  });

  test('Save and Discard are disabled until something changes', async ({ signedIn }) => {
    await expect(signedIn.tid('save-profile-button')).toBeDisabled();
    await expect(signedIn.tid('reset-profile-button')).toBeDisabled();
    await signedIn.tid('profile-firstname').fill('Changed');
    await expect(signedIn.tid('save-profile-button')).toBeEnabled();
    await signedIn.tid('reset-profile-button').click();
    await expect(signedIn.tid('profile-firstname')).toHaveValue('Demo');
    await expect(signedIn.tid('save-profile-button')).toBeDisabled();
  });

  test('empty first name or email is rejected', async ({ signedIn }) => {
    await signedIn.tid('profile-firstname').fill('');
    await signedIn.tid('save-profile-button').click();
    await expect(signedIn.tid('profile-error')).toHaveText('Please fill in your name and email.');
  });

  test('email already used by another account is rejected', async ({ signedIn }) => {
    // Accounts live in memory, so move between screens with in-app links (no page reloads)
    const other = { name: 'Other Person', email: 'other.person@example.com', password: 'secret12' };
    await signedIn.signOut();
    await signedIn.tid('go-to-register').click();
    await signedIn.submitRegister(other);
    await signedIn.enterCode();
    await signedIn.tid('ob-next-1').click();
    await signedIn.tid('ob-finish').click();
    await signedIn.signOut();
    await signedIn.submitLogin('demo@zary.app', 'demo123');
    await signedIn.enterCode();
    await signedIn.go('profile');
    await signedIn.tid('profile-email').fill(other.email);
    await signedIn.tid('save-profile-button').click();
    await expect(signedIn.tid('profile-error')).toHaveText('An account with this email already exists.');
  });
});

test.describe('Settings: security', () => {
  test.beforeEach(async ({ signedIn }) => { await signedIn.openSettingsTab('security'); });

  test('button stays disabled until all fields are filled', async ({ signedIn }) => {
    await expect(signedIn.tid('change-password-button')).toBeDisabled();
    await signedIn.tid('current-password').fill('x');
    await signedIn.tid('new-password').fill('y');
    await expect(signedIn.tid('change-password-button')).toBeDisabled();
  });

  test('wrong current password is rejected', async ({ signedIn }) => {
    await signedIn.tid('current-password').fill('nope');
    await signedIn.tid('new-password').fill('newpass99');
    await signedIn.tid('confirm-password').fill('newpass99');
    await signedIn.tid('change-password-button').click();
    await expect(signedIn.tid('password-error')).toHaveText('Current password is incorrect.');
  });

  test('mismatch is flagged while typing', async ({ signedIn }) => {
    await signedIn.tid('new-password').fill('newpass99');
    await signedIn.tid('confirm-password').fill('newpass9');
    await expect(signedIn.page.getByText('Passwords do not match yet.')).toBeVisible();
    await signedIn.tid('confirm-password').fill('newpass99');
    await expect(signedIn.page.getByText('Passwords do not match yet.')).toBeHidden();
  });

  test('new password under 6 characters is rejected', async ({ signedIn }) => {
    await signedIn.tid('current-password').fill(DEMO.password);
    await signedIn.tid('new-password').fill('abc');
    await signedIn.tid('confirm-password').fill('abc');
    await signedIn.tid('change-password-button').click();
    await expect(signedIn.tid('password-error')).toHaveText('New password must be at least 6 characters.');
  });

  for (const [pw, label] of [['abc', 'Too short'], ['abcdef', 'Weak'], ['abcdefghij', 'Fair'], ['Abcdefghij', 'Good'], ['Abcdefghi1!', 'Strong']]) {
    test(`strength meter says "${label}" for ${pw}`, async ({ signedIn }) => {
      await signedIn.tid('new-password').fill(pw);
      await expect(signedIn.page.getByText(`Strength: ${label}`)).toBeVisible();
    });
  }

  test('changed password works on the next sign-in, the old one does not', async ({ signedIn }) => {
    await signedIn.tid('current-password').fill(DEMO.password);
    await signedIn.tid('new-password').fill('brandNew42');
    await signedIn.tid('confirm-password').fill('brandNew42');
    await signedIn.tid('change-password-button').click();
    await expect(signedIn.toast()).toContainText('Password updated');
    await signedIn.signOut();
    await signedIn.submitLogin(DEMO.email, DEMO.password);
    await expect(signedIn.tid('login-error')).toHaveText('Invalid email or password.');
    await signedIn.submitLogin(DEMO.email, 'brandNew42');
    await signedIn.enterCode();
    await expect(signedIn.tid('page-dashboard')).toBeVisible();
  });
});

test.describe('Settings: preferences', () => {
  test.beforeEach(async ({ signedIn }) => { await signedIn.openSettingsTab('preferences'); });

  test('dark mode switch and top bar toggle stay in sync', async ({ signedIn }) => {
    expect(await signedIn.theme()).toBe('dark');
    await signedIn.tid('toggle-theme').uncheck();
    expect(await signedIn.theme()).toBe('light');
    await signedIn.tid('theme-toggle').click();
    expect(await signedIn.theme()).toBe('dark');
    await expect(signedIn.tid('toggle-theme')).toBeChecked();
  });

  test('theme choice survives signing out and back in', async ({ signedIn }) => {
    await signedIn.tid('toggle-theme').uncheck();
    await signedIn.signOut();
    expect(await signedIn.theme()).toBe('light');
    await signedIn.signIn();
    expect(await signedIn.theme()).toBe('light');
  });

  test('currency and notification switches confirm the change', async ({ signedIn }) => {
    await signedIn.tid('currency-select').selectOption('EUR');
    await expect(signedIn.toast()).toContainText('Currency set to EUR');
    await signedIn.tid('toggle-notifications').uncheck();
    await expect(signedIn.toast()).toContainText('Weekly summary off');
    await signedIn.tid('toggle-budget-alerts').uncheck();
    await expect(signedIn.toast()).toContainText('Budget alerts off');
    await signedIn.tid('toggle-2fa').uncheck();
    await expect(signedIn.toast()).toContainText('Two-step sign-in off');
  });
});

test.describe('Settings: account', () => {
  test.beforeEach(async ({ signedIn }) => {
    await signedIn.go('expenses');
    await signedIn.addExpense({ desc: 'Something', amount: 1000 });
    await signedIn.go('transfer');
    await signedIn.transfer(10000);
    await signedIn.openSettingsTab('account');
  });

  test('Cancel and Escape keep the data', async ({ signedIn, page }) => {
    await signedIn.tid('clear-expenses-button').click();
    await signedIn.tid('confirm-cancel').click();
    await expect(signedIn.tid('confirm-dialog')).toBeHidden();
    await signedIn.tid('clear-expenses-button').click();
    await page.keyboard.press('Escape');
    await expect(signedIn.tid('confirm-dialog')).toBeHidden();
    await expect(signedIn.tid('profile-stat-expenses')).toHaveText('1');
  });

  test('clear expenses keeps transfers', async ({ signedIn }) => {
    await signedIn.tid('clear-expenses-button').click();
    await signedIn.confirm();
    await expect(signedIn.tid('profile-stat-expenses')).toHaveText('0');
    await expect(signedIn.tid('profile-stat-transfers')).toHaveText('1');
  });

  test('reset data restores the starting balances', async ({ signedIn }) => {
    await signedIn.tid('reset-account-button').click();
    await signedIn.confirm();
    await expect(signedIn.tid('profile-stat-expenses')).toHaveText('0');
    await expect(signedIn.tid('profile-stat-transfers')).toHaveText('0');
    await signedIn.go('transfer');
    await expect(signedIn.tid('main-balance')).toHaveText('XOF 940,000');
    await expect(signedIn.tid('savings-balance')).toHaveText('XOF 300,000');
  });

  test('a deleted account can no longer sign in @smoke', async ({ app }) => {
    // Uses a fresh account so the demo account stays usable
    await app.signOut();
    const user = await app.signUp();
    await app.openSettingsTab('account');
    await app.tid('delete-account-button').click();
    await app.confirm();
    await expect(app.tid('login-button')).toBeVisible();
    await app.submitLogin(user.email, user.password);
    await expect(app.tid('login-error')).toHaveText('Invalid email or password.');
  });
});
