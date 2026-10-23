import { test, expect } from './fixtures.js';

test.describe('Session timeout', () => {
  test.beforeEach(async ({ app, page }) => {
    await page.clock.install();
    await app.signIn();
    await page.mouse.move(5, 5);
  });

  test('after 5 idle minutes a 60-second warning appears', async ({ app, page }) => {
    await expect(app.tid('session-banner')).not.toHaveClass(/show/);
    await page.clock.runFor('04:59');
    await expect(app.tid('session-banner')).not.toHaveClass(/show/);
    await page.clock.runFor(2000);
    await expect(app.tid('session-banner')).toHaveClass(/show/);
    await expect(app.tid('session-countdown')).toHaveText(/^(59|60)s$/);
  });

  test('"Stay logged in" hides the warning and restarts the timer', async ({ app, page }) => {
    await page.clock.runFor('05:01');
    await app.tid('stay-logged-in').click();
    await expect(app.tid('session-banner')).not.toHaveClass(/show/);
    await page.clock.runFor('04:30');
    await expect(app.tid('session-banner')).not.toHaveClass(/show/);
  });

  test('letting the countdown run out signs the user out', async ({ app, page }) => {
    await page.clock.runFor('05:01');
    await expect(app.tid('session-banner')).toHaveClass(/show/);
    await page.clock.runFor('01:01');
    await expect(page).toHaveURL(/\/app\/login$/);
  });
});
