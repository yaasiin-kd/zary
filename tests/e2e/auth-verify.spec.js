import { test, expect } from './fixtures.js';
import { DEMO } from './support/app.js';

test.describe('Code verification', () => {
  test.beforeEach(async ({ app }) => {
    await app.openLogin();
    await app.submitLogin(DEMO.email, DEMO.password);
    await expect(app.tid('otp-display')).toBeVisible();
  });

  const wrongCode = (code) => code.split('').map((d) => String((Number(d) + 1) % 10)).join('');

  test('wrong code is rejected @smoke', async ({ app }) => {
    await app.enterCode(wrongCode(await app.readCode()));
    await expect(app.tid('otp-error')).toHaveText('Incorrect code. Try again.');
  });

  test('incomplete code asks for all 6 digits', async ({ app }) => {
    await app.tid('otp-digit-1').fill('1');
    await app.tid('verify-otp-button').click();
    await expect(app.tid('otp-error')).toHaveText('Please enter all 6 digits.');
  });

  test('typing a digit moves focus to the next box', async ({ app }) => {
    await app.tid('otp-digit-1').fill('4');
    await expect(app.tid('otp-digit-2')).toBeFocused();
  });

  test('Backspace on an empty box clears and focuses the previous one', async ({ app }) => {
    await app.tid('otp-digit-1').fill('4');
    await app.tid('otp-digit-2').fill('8');
    await expect(app.tid('otp-digit-3')).toBeFocused();
    await app.page.keyboard.press('Backspace');
    await expect(app.tid('otp-digit-2')).toBeFocused();
    await expect(app.tid('otp-digit-2')).toHaveValue('');
  });

  test('letters are ignored', async ({ app }) => {
    await app.tid('otp-digit-1').pressSequentially('a');
    await expect(app.tid('otp-digit-1')).toHaveValue('');
  });

  test('pasting the full code fills every box and verifies', async ({ app, page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Synthetic paste events are Chromium-only');
    const code = await app.readCode();
    await app.tid('otp-digit-1').focus();
    await page.evaluate((value) => {
      const data = new DataTransfer();
      data.setData('text/plain', value);
      document.activeElement.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
    }, code);
    await expect(app.tid('page-dashboard')).toBeVisible();
  });

  test('resend gives a new code, clears the boxes and restarts the timer', async ({ app }) => {
    const first = await app.readCode();
    await app.tid('otp-digit-1').fill('1');
    await app.tid('resend-otp').click();
    await expect(app.tid('otp-digit-1')).toHaveValue('');
    await expect(app.tid('otp-timer')).toHaveText('02:00');
    const second = await app.readCode();
    expect(second).toMatch(/^\d{6}$/);
    expect.soft(second).not.toBe(first);
  });
});

test.describe('Code expiry', () => {
  test('after 2 minutes the code expires and is rejected', async ({ app, page }) => {
    await page.clock.install();
    await app.openLogin();
    await app.submitLogin(DEMO.email, DEMO.password);
    const code = await app.readCode();
    await expect(app.tid('otp-timer')).toHaveText('02:00');
    await page.clock.runFor('02:01');
    await expect(app.tid('otp-timer')).toHaveText('Expired');
    await app.enterCode(code);
    await expect(app.tid('otp-error')).toHaveText('This code has expired. Request a new one.');
  });
});
