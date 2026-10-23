import base from './playwright.config.js';

// Same as playwright.config.js, but keeps a video of every test, passed or failed.
// Used by `npm run test:e2e:video`.
export default {
  ...base,
  use: { ...base.use, video: 'on' },
};
