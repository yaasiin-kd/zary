import { test as base, expect } from '@playwright/test';
import { ZaryApp } from './support/app.js';

/**
 * `app`      a ZaryApp page object on a fresh page
 * `signedIn` the same, already signed in with the demo account and on Overview
 */
export const test = base.extend({
  app: async ({ page }, use) => {
    await use(new ZaryApp(page));
  },
  signedIn: async ({ page }, use) => {
    const app = new ZaryApp(page);
    await app.signIn();
    await use(app);
  },
});

export { expect };
