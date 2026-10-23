import { test, expect } from './fixtures.js';
import { DEMO } from './support/app.js';

test.describe('Sign in', () => {
  test.beforeEach(async ({ app }) => { await app.openLogin(); });

  test('demo account signs in through the code screen @smoke', async ({ app, page }) => {
    await app.submitLogin(DEMO.email, DEMO.password);
    await expect(page).toHaveURL(/\/app\/verify$/);
    await app.enterCode();
    await expect(page).toHaveURL(/\/app\/dashboard$/);
    await expect(app.tid('user-name')).toHaveText('Demo');
  });

  test('wrong password is rejected @smoke', async ({ app }) => {
    await app.submitLogin(DEMO.email, 'wrong-password');
    await expect(app.tid('login-error')).toHaveText('Invalid email or password.');
  });

  test('empty form asks for all fields', async ({ app }) => {
    await app.tid('login-button').click();
    await expect(app.tid('login-error')).toHaveText('Please fill in all fields.');
  });

  test('unknown email gets the same message as a wrong password', async ({ app }) => {
    await app.submitLogin('nobody@example.com', 'whatever1');
    await expect(app.tid('login-error')).toHaveText('Invalid email or password.');
  });

  test('pressing Enter submits the form', async ({ app, page }) => {
    await app.tid('email-input').fill(DEMO.email);
    await app.tid('password-input').fill(DEMO.password);
    await app.tid('password-input').press('Enter');
    await expect(page).toHaveURL(/\/app\/verify$/);
  });

  test('logo goes back to the landing page', async ({ app, page }) => {
    await app.tid('auth-logo-link').click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('"Create one" opens sign-up', async ({ app, page }) => {
    await app.tid('go-to-register').click();
    await expect(page).toHaveURL(/\/app\/register$/);
  });
});
