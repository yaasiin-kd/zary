import base from './playwright.config.js';

/*
 * Training suite: deliberately broken tests used to practise reading and fixing failures.
 * Run with `npm run test:e2e:training`. Never run in CI, and not part of `npm run test:e2e`.
 * Everything is recorded (video, trace, screenshot) so each failure can be replayed.
 */
const chromium = base.projects.find((p) => p.name === 'chromium');

export default {
  ...base,
  testDir: 'tests/training',
  retries: 1, // lets the "flaky" example show up as flaky in the report
  workers: 1, // run in order, easier to follow during a session
  use: { ...base.use, video: 'on', trace: 'on', screenshot: 'on' },
  projects: [{ name: 'training', use: { ...chromium.use } }],
};
