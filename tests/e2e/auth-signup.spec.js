import { test, expect } from './fixtures.js';
import { DEMO, uniqueEmail } from './support/app.js';

test.describe('Sign up and onboarding', () => {
  test('new account goes through code, budgets and currency to Overview @smoke', async ({ app }) => {
    await app.signUp({ name: 'Ama Koffi' });
    await expect(app.tid('user-name')).toHaveText('Ama');
    await expect(app.page.locator('.z-page-head h1')).toContainText(', Ama');
  });

  test('empty form asks for all fields', async ({ app }) => {
    await app.openRegister();
    await app.tid('register-button').click();
    await expect(app.tid('register-error')).toHaveText('Please fill in all fields.');
  });

  test('password under 6 characters is rejected', async ({ app }) => {
    await app.openRegister();
    await app.submitRegister({ name: 'Short Pass', email: uniqueEmail(), password: '12345' });
    await expect(app.tid('register-error')).toHaveText('Password must be at least 6 characters.');
  });

  test('email already registered is rejected', async ({ app }) => {
    await app.openRegister();
    await app.submitRegister({ name: 'Copy Cat', email: DEMO.email, password: 'secret12' });
    await expect(app.tid('register-error')).toHaveText('An account with this email already exists.');
  });

  test('budget limits from onboarding appear on the Budget page', async ({ app }) => {
    await app.signUp({ limits: { food: 100000, transport: 15000 } });
    await app.go('budget');
    await expect(app.tid('budget-food')).toContainText('of XOF 100,000');
    await expect(app.tid('budget-transport')).toContainText('of XOF 15,000');
  });

  test('Back on step 2 keeps the values from step 1', async ({ app }) => {
    await app.openRegister();
    await app.submitRegister({ name: 'Back Test', email: uniqueEmail(), password: 'secret12' });
    await app.enterCode();
    await app.tid('ob-food').fill('123456');
    await app.tid('ob-next-1').click();
    await expect(app.tid('ob-currency')).toBeVisible();
    await app.tid('ob-back').click();
    await expect(app.tid('ob-food')).toHaveValue('123456');
  });

  test('zero or empty limits fall back to the defaults', async ({ app }) => {
    await app.signUp({ limits: { food: 0, health: '' } });
    await app.go('budget');
    await expect(app.tid('budget-food')).toContainText('of XOF 80,000');
    await expect(app.tid('budget-health')).toContainText('of XOF 50,000');
  });

  test('"Sign in" link goes back to sign-in', async ({ app, page }) => {
    await app.openRegister();
    await app.tid('go-to-login').click();
    await expect(page).toHaveURL(/\/app\/login$/);
  });
});
