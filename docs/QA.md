# Zary QA guide

Everything you need to run, read, write and maintain the automated tests for Zary.

- [1. Overview](#1-overview)
- [2. Setup](#2-setup)
- [3. Running the tests](#3-running-the-tests)
- [4. What is covered](#4-what-is-covered)
- [5. How the suite is organised](#5-how-the-suite-is-organised)
- [6. Writing a new test](#6-writing-a-new-test)
- [7. When a test fails](#7-when-a-test-fails)
- [8. Continuous integration](#8-continuous-integration)
- [9. Training suite](#9-training-suite)
- [10. Maintenance](#10-maintenance)
- [11. Quick reference](#11-quick-reference)

---

## 1. Overview

| | |
| --- | --- |
| Tool | [Playwright](https://playwright.dev) 1.49.1, JavaScript |
| Location | `tests/e2e` (main suite), `tests/training` (deliberate failures for practice) |
| Size | 137 tests in the main suite, 15 of them tagged `@smoke` |
| Browsers | Chromium (desktop and phone), Firefox and WebKit (smoke only) |
| Runs | Locally on demand, and on GitHub on every pull request and push to `main` |
| Duration | About 1.5 minutes for the full Chromium suite, about 2 minutes per CI job |

The tests drive the real app in a real browser: they click, type and check what a user would see. They start the app themselves, so there is no server to launch first.

**How the app behaves, and why it matters for testing**

- All data (accounts, expenses, transfers) lives **in memory**. Reloading the page signs you out and resets everything except the theme. Every test therefore starts from a clean app.
- The demo account is `demo@zary.app` / `demo123`. The six-digit sign-in code is printed on the verification screen, so tests read it from there.
- Every interactive element has a `data-testid`, which is how the tests find things.

---

## 2. Setup

Requirements: **Node.js 20** (18 or later works) and Git.

```bash
git clone https://github.com/yaasiin-kd/zary.git
cd zary
npm install
npx playwright install            # downloads Chromium, Firefox and WebKit (first time only)
```

On Linux, use `npx playwright install --with-deps` to also install the system libraries the browsers need.

Check that everything works:

```bash
npm run test:e2e:smoke
```

You should see 45 passed: the 15 smoke tests in Chromium, Firefox and WebKit.

Recommended editor setup: VS Code with the official **Playwright Test for VS Code** extension. It lets you run a single test from the editor, set breakpoints and pick locators on the page.

---

## 3. Running the tests

### npm scripts

| Command | What it does |
| --- | --- |
| `npm run test:e2e` | The whole main suite, in every project |
| `npm run test:e2e:smoke` | Only tests tagged `@smoke` |
| `npm run test:e2e:ui` | Playwright's interactive UI: pick tests, watch them step by step, time-travel through each action |
| `npm run test:e2e:video` | Same as `test:e2e`, but keeps a video of **every** test, passed or failed |
| `npm run test:e2e:trace` | Same as `test:e2e`, but keeps a full trace of **every** test |
| `npm run test:e2e:training` | The training suite of deliberate failures (section 9) |
| `npm run test:e2e:report` | Opens the HTML report of the last run |

### Useful options

Add them after `npx playwright test`, or after any script with `--`, for example `npm run test:e2e -- --project=chromium`.

```bash
npx playwright test --project=chromium          # one browser
npx playwright test tests/e2e/expenses.spec.js  # one file
npx playwright test expenses.spec.js:24         # one test, by line number
npx playwright test -g "undo"                   # tests whose title contains "undo"
npx playwright test --headed                    # show the browser window
npx playwright test --debug                     # step through with the Playwright inspector
npx playwright test --repeat-each=5             # hunt for flaky tests
npx playwright test --list                      # list tests without running them
```

### What happens when you run

1. Playwright builds the app (`npm run build`) and serves it on `http://localhost:4173`. If something already runs on that port, it reuses it.
2. Tests run in parallel, each in a fresh browser context.
3. Results print in the terminal, and an HTML report is written to `playwright-report/`.

---

## 4. What is covered

| Spec file | Area | Tests | What it checks |
| --- | --- | --- | --- |
| `routing.spec.js` | Access | 12 | Signed-out redirects, verify and welcome screens need a sign-in first, unknown routes, refresh signs out |
| `landing.spec.js` | Landing page | 12 | Sections render, every "Open Zary" button, header anchors, FAQ, demo credentials, WebGL and reduced-motion fallbacks |
| `auth-signin.spec.js` | Sign in | 7 | Demo sign-in, wrong password, empty form, unknown email, Enter key, logo and sign-up links |
| `auth-verify.spec.js` | Code verification | 8 | Wrong and incomplete codes, focus movement, Backspace, letters ignored, paste, resend, 2-minute expiry |
| `auth-signup.spec.js` | Sign up and onboarding | 8 | Full flow, validation, duplicate email, budget limits carried over, Back keeps values, defaults for empty limits |
| `navigation.spec.js` | Layout | 6 | Sidebar links and active state, collapse, tooltips, top bar shortcuts, sign out |
| `dashboard.spec.js` | Overview | 8 | Starting figures, updates after spending, savings goal badge, recent activity, budget health, greeting by time of day |
| `expenses.spec.js` | Expenses | 17 | Add, delete, field errors, undo and its 4-second window, monthly badge, ordering, pagination, search, filters, CSV export |
| `budget.spec.js` | Budget | 10 | Amounts and progress, status thresholds (75% and 100%), editing and cancelling limits, validation, summary, left or over |
| `transfer.spec.js` | Transfer | 6 | Both directions, insufficient balance, empty amount, quick amounts, history |
| `settings.spec.js` | Settings | 21 | Profile save and discard, duplicate email, password rules and strength meter, password change end to end, theme, preferences, clear, reset and delete account |
| `session.spec.js` | Session timeout | 3 | Warning after 5 idle minutes, "Stay logged in", automatic sign-out |
| `responsive.spec.js` | Phone layout | 5 | Bottom navigation, top bar, forms usable, no sideways scrolling, landing page |
| `accessibility.spec.js` | Accessibility | 14 | Automated WCAG 2.1 AA scans (axe) on every page in dark and light mode, plus a keyboard-only flow |

**Smoke suite (`@smoke`)**: the 15 most important paths. Signed-out redirect, landing page, demo sign-in, wrong password, wrong code, sign-up, navigation, sign out, Overview figures, add and delete an expense, budget update, transfer, profile save, and deleting an account.

**Not covered on purpose**

- Pixel-by-pixel visual comparisons: fonts and rendering differ between machines, which makes them noisy. Colour contrast is covered by the accessibility scans instead.
- The 3D banknote animation itself: it is decorative. The tests check the fallback when WebGL is missing.

---

## 5. How the suite is organised

```
playwright.config.js           Main configuration
playwright.video.config.js     Same, with video always on (used by test:e2e:video)
playwright.training.config.js  Training suite configuration
tests/
├── e2e/
│   ├── fixtures.js            Custom fixtures: app and signedIn
│   ├── support/app.js         Page object: the actions a user takes
│   └── *.spec.js              One file per area (section 4)
└── training/
    ├── failures.spec.js       Deliberately broken tests
    └── README.md              Answers for the trainer
.github/workflows/e2e.yml      CI pipeline
```

### Projects

| Project | Device | Runs |
| --- | --- | --- |
| `chromium` | Desktop Chrome | The full suite except the phone layout file |
| `mobile` | Pixel 7 | `responsive.spec.js` only |
| `firefox` | Desktop Firefox | `@smoke` tests only |
| `webkit` | Desktop Safari | `@smoke` tests only |

### Main settings

| Setting | Value | Why |
| --- | --- | --- |
| Base URL | `http://localhost:4173` | So tests can use `page.goto('/app/login')` |
| Locale, timezone | `en-GB`, `Africa/Lome` | Dates and greetings are predictable |
| Timeouts | 30 s per test, 5 s per assertion | Fail fast instead of hanging |
| Retries | 0 locally, 1 on CI | A retry on CI also records a trace for diagnosis |
| Screenshot | On failure | |
| Video | Kept on failure | `test:e2e:video` keeps them all |
| Trace | On the first retry | `test:e2e:trace` keeps them all |

### Fixtures

Use these instead of the plain `page` in tests:

| Fixture | Gives you |
| --- | --- |
| `app` | A `ZaryApp` page object on a fresh page, not signed in |
| `signedIn` | The same, already signed in with the demo account and on Overview |

### The page object (`support/app.js`)

`ZaryApp` wraps what a user does, so tests read like steps:

| Method | Does |
| --- | --- |
| `tid(id)` | Shortcut for `page.getByTestId(id)` |
| `openLogin()`, `submitLogin(email, password)` | Sign-in screen |
| `readCode()`, `enterCode(code?)` | Reads the code from the screen and types it (or a given one) |
| `signIn({ email, password })` | Full sign-in, waits for Overview |
| `openRegister()`, `submitRegister({...})`, `signUp({...})` | Sign-up, `signUp` also completes onboarding and returns the account |
| `signOut()` | Signs out and waits for the sign-in screen |
| `go(section)` | Opens `dashboard`, `expenses`, `budget`, `transfer` or `profile` from the sidebar |
| `openSettingsTab(tab)` | Opens Settings on `profile`, `security`, `preferences` or `account` |
| `addExpense({ desc, amount, cat, monthly })`, `addExpenses([...])` | Adds expenses from the Expenses page |
| `expenseRows()` | All expense rows in the list |
| `transfer(amount, note?)` | Fills and submits the transfer form |
| `confirm()` | Accepts the confirmation dialog |
| `toast()`, `theme()` | The confirmation message, and the current theme |

Also exported: `DEMO` (demo credentials) and `uniqueEmail()` for new accounts.

---

## 6. Writing a new test

### Template

```js
import { test, expect } from './fixtures.js';

test.describe('Expenses', () => {
  test('a monthly expense shows the Monthly badge', async ({ signedIn }) => {
    await signedIn.go('expenses');
    await signedIn.addExpense({ desc: 'Internet', amount: 15000, cat: 'Utilities', monthly: true });
    await expect(signedIn.expenseRows().first()).toContainText('Monthly');
  });
});
```

Add ` @smoke` at the end of the title only for critical paths.

### Rules of thumb

1. **One behaviour per test**, with a title that says what should happen.
2. **Find elements with `getByTestId` or `getByRole`**, never with CSS classes or text that may change. Need a new hook? Add a `data-testid` in the app.
3. **Use web-first assertions** like `await expect(locator).toHaveText(...)`. They wait and retry. Never read a value with `textContent()` and compare it later: that is a snapshot, and the page may not have caught up.
4. **No fixed waits** (`waitForTimeout`). For timers, use Playwright's clock instead:
   ```js
   await page.clock.install();         // before the timers start
   await page.clock.runFor('05:00');   // jump 5 minutes ahead, firing every timer
   ```
5. **Keep tests independent.** Never rely on another test. Use `uniqueEmail()` for new accounts.
6. **Mind the in-memory data.** `page.goto()` reloads the app and wipes accounts and data. Within a test that needs earlier data, move between screens with in-app links (`signedIn.go(...)`, clicking links).
7. **Locators must match exactly one element.** If several match, Playwright reports a strict mode violation. Make the locator more specific.
8. **Check the requirement, not your memory of it.** Thresholds, messages and amounts are listed in section 11.

### Before you open a pull request

```bash
npx playwright test tests/e2e/your.spec.js --repeat-each=3   # stable?
npm run test:e2e                                             # nothing else broke?
```

---

## 7. When a test fails

1. **Read the error first.** It says what was expected, what was received, and which line failed.
2. **Open the report**: `npm run test:e2e:report`. Each failed test has the error, a screenshot and a video.
3. **Open the trace** (from the report, or `npx playwright show-trace path/to/trace.zip`). It shows every action on a timeline, the page before and after each step (you can inspect the elements), console messages and network calls. To always get one locally, run with `npm run test:e2e:trace` or `--trace on`.
4. **Reproduce and step through**: `npx playwright test <file>:<line> --debug`, or `npm run test:e2e:ui`.
5. **Decide who is wrong.** If the app does not match the requirement, it is a bug: report it with the trace attached. If the test assumed something wrong, fix the test.

### Common errors

| Error | Usual cause |
| --- | --- |
| `Timed out ... waiting for getByTestId(...)` | Wrong test id, or the element is on another screen or tab |
| `strict mode violation: ... resolved to N elements` | The locator matches several elements |
| `Expected ... Received ...` | Wrong expected value, or a real bug |
| Expected count 1, received 0 after `page.goto` | The reload wiped the in-memory data |
| Passes alone, fails with others | The test depends on shared state |
| **flaky** in the report | Failed, then passed on retry. Investigate it, don't ignore it |

---

## 8. Continuous integration

**File**: `.github/workflows/e2e.yml`

**When it runs**: on every pull request to `main`, every push to `main`, and manually from the Actions tab (Run workflow).

**What it runs**: two jobs in parallel.

| Job | Projects | Tests | Duration |
| --- | --- | --- | --- |
| Full suite (Chromium desktop and phone) | `chromium`, `mobile` | 137 | about 2 min |
| Smoke suite (Firefox and WebKit) | `firefox`, `webkit` | 30 | about 1.5 min |

Both jobs run inside the official Playwright Docker image (`mcr.microsoft.com/playwright:v1.49.1-noble`), which already contains the browsers. That avoids downloading and installing them on every run, which used to take several minutes.

**Results**: shown on the pull request and in the Actions tab. Each job attaches its HTML report as an artifact (`playwright-report-chromium` and `playwright-report-other-browsers`, kept 14 days). Download it, unzip it and open `index.html`, or run `npx playwright show-report <folder>`.

**Blocking merges on failures**: in the GitHub repository, go to Settings, Branches, add a rule for `main`, enable "Require status checks to pass before merging", and select both E2E jobs.

**Deploys**: Netlify deploys `main` independently. Requiring the checks keeps broken code from reaching `main` in the first place.

---

## 9. Training suite

`tests/training` holds tests that **fail on purpose**, to practise reading and fixing failures. They never run in CI and are not part of `npm run test:e2e`.

```bash
npm run test:e2e:training
npm run test:e2e:report
```

Every training test records a video, a trace and screenshots. Expected outcome: 9 failed, 1 flaky, 1 passed as an expected failure, 1 skipped.

| # | Teaches |
| --- | --- |
| 01 | Reading expected versus received |
| 02 | A locator that never matches (typo in a test id) |
| 03 | Strict mode: a locator that matches several elements |
| 04 | Timing assumptions and the test clock |
| 05 | Checking the requirement: is the app or the test wrong? |
| 06 | Data lost by a page reload (test isolation) |
| 07 | Snapshot reads versus web-first assertions |
| 08 | Soft assertions reporting several failures at once |
| 09 | Responsive behaviour on phone sizes |
| 10 | What a flaky test looks like, and how retries hide it |
| 11 | Documenting a known issue with `test.fail()` |
| 12 | Parking an unwritten test with `test.fixme()` |

Suggested routine per test: run it, read the error, open the trace, decide whether the test or the app is wrong, fix it, run it again. The answers are in `tests/training/README.md`.

---

## 10. Maintenance

**Upgrading Playwright**: update both together, or CI will use mismatched browsers.

1. `npm install -D @playwright/test@<version>` (and `npx playwright install` locally)
2. Change the image tag in `.github/workflows/e2e.yml` to `mcr.microsoft.com/playwright:v<version>-noble`
3. Run the full suite before merging

**When the app changes**

- Renamed or removed a `data-testid`: update the page object first, since most tests go through it.
- Changed a message, amount or threshold: update the matching expectations, and section 11.
- New feature: add a spec file or a `describe` block, and decide whether it deserves an `@smoke` test.

**Keeping the suite healthy**

- A flaky test is a bug. Fix it or quarantine it with `test.fixme()` and a reason, never leave it red.
- Keep the smoke suite small (around 15 tests) so cross-browser runs stay quick.
- Accessibility failures are real issues for users. Fix the app rather than disabling the rule.

**Running in an environment without Playwright's browsers** (some sandboxes and corporate machines): point the config at any Chromium build with `PW_CHROMIUM_PATH=/path/to/chrome npx playwright test --project=chromium`. Video recording is turned off in that mode.

---

## 11. Quick reference

### Accounts and starting data

| Item | Value |
| --- | --- |
| Demo account | `demo@zary.app` / `demo123` |
| Main account | XOF 940,000 |
| Savings | XOF 300,000 |
| Total balance | XOF 1,240,000 |
| Monthly income | XOF 450,000 |
| Monthly budget (Overview) | XOF 300,000 |
| Savings goal | 40% of income |

### Default budget limits (XOF)

| Food | Transport | Utilities | Health | Entertainment | Other | Total |
| --- | --- | --- | --- | --- | --- | --- |
| 80,000 | 40,000 | 30,000 | 50,000 | 25,000 | 20,000 | 245,000 |

### Rules and timings

| Rule | Value |
| --- | --- |
| Sign-in code | 6 digits, expires after 2 minutes |
| Password | At least 6 characters |
| Expense description | Up to 60 characters |
| Undo after adding or deleting an expense | 4 seconds |
| Other confirmation messages | 2.5 seconds |
| Expenses per page | 8, newest first |
| Budget status | Under 75% "On track", 75% to 99% "Close to limit", 100% and over "Over budget" |
| Idle sign-out | Warning after 5 minutes, signed out 60 seconds later |
| Quick transfer amounts | 10,000, 25,000, 50,000, 100,000 |

### Messages the tests check

| Screen | Message |
| --- | --- |
| Sign in | Please fill in all fields. / Invalid email or password. |
| Sign up | Password must be at least 6 characters. / An account with this email already exists. |
| Code | Please enter all 6 digits. / Incorrect code. Try again. / This code has expired. Request a new one. |
| Expenses | Add a short description. / Enter an amount greater than 0. |
| Budget | Enter a limit greater than 0. |
| Transfer | Enter a valid amount. / Insufficient balance in Main Account. / Insufficient balance in Savings Account. |
| Profile | Please fill in your name and email. / An account with this email already exists. |
| Password | Current password is incorrect. / New password must be at least 6 characters. / Passwords do not match yet. |

### Useful test ids

| Area | Test ids |
| --- | --- |
| Sign in | `email-input`, `password-input`, `login-button`, `login-error`, `go-to-register`, `auth-logo-link` |
| Code | `otp-display`, `otp-digit-1` to `otp-digit-6`, `verify-otp-button`, `otp-error`, `otp-timer`, `resend-otp` |
| Sign up | `register-name`, `register-email`, `register-password`, `register-button`, `register-error` |
| Onboarding | `onboarding`, `ob-food`, `ob-transport`, `ob-utilities`, `ob-health`, `ob-entertain`, `ob-other`, `ob-next-1`, `ob-back`, `ob-currency`, `ob-country`, `ob-finish` |
| Layout | `nav-<section>`, `bnav-<section>`, `sidebar-toggle`, `theme-toggle`, `top-add-expense`, `top-profile`, `user-name`, `user-email`, `logout-button` |
| Overview | `page-dashboard`, `total-balance`, `monthly-income`, `monthly-expenses`, `savings-rate`, `budget-used`, `activity-row`, `dash-add-expense` |
| Expenses | `expense-description`, `expense-amount`, `expense-category`, `expense-recurring`, `add-expense-button`, `expense-description-error`, `expense-amount-error`, `search-expenses`, `filter-category`, `export-csv`, `expense-count`, `expense-row-<id>`, `delete-expense-<id>`, `empty-expenses`, `clear-filters`, `pagination-info`, `pagination-prev`, `pagination-next`, `pagination-page-<n>` |
| Budget | `budget-<cat>`, `budget-pct-<cat>`, `budget-left-<cat>`, `budget-edit-<cat>`, `budget-limit-<cat>`, `budget-save-<cat>`, `budget-total`, `budget-remaining`, `budget-close-count`, `budget-over-count` |
| Transfer | `transfer-amount`, `transfer-note`, `transfer-button`, `transfer-error`, `transfer-swap`, `transfer-quick-<amount>`, `main-balance`, `savings-balance`, `transfer-row-<id>`, `empty-transfers` |
| Settings | `tab-profile`, `tab-security`, `tab-preferences`, `tab-account`, `profile-firstname`, `profile-lastname`, `profile-email`, `profile-phone`, `profile-country`, `save-profile-button`, `reset-profile-button`, `profile-error`, `profile-name-display`, `current-password`, `new-password`, `confirm-password`, `change-password-button`, `password-error`, `toggle-theme`, `currency-select`, `toggle-notifications`, `toggle-budget-alerts`, `toggle-2fa`, `clear-expenses-button`, `reset-account-button`, `delete-account-button`, `profile-stat-expenses`, `profile-stat-transfers`, `profile-stat-saved` |
| Shared | `success-toast`, `undo-button`, `confirm-dialog`, `confirm-accept`, `confirm-cancel`, `session-banner`, `session-countdown`, `stay-logged-in` |

`<section>` is one of `dashboard`, `expenses`, `budget`, `transfer`, `profile`. `<cat>` is a lowercase category: `food`, `transport`, `utilities`, `health`, `entertainment`, `other`.
