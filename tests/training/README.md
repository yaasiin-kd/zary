# Training suite: deliberate failures

These tests fail on purpose so you can practise reading Playwright failures, replaying them and fixing them.
They are **not** part of `npm run test:e2e` and never run in CI.

```bash
npm run test:e2e:training          # run them all (in order, one at a time)
npm run test:e2e:report            # open the report: error, screenshot, video and trace for each test
npx playwright show-trace <trace.zip>   # or open a single trace
```

Every test records a video, a trace and a screenshot, so each failure can be replayed step by step.

## Suggested way to run the session

For each test: run it, read the error message first, then open the trace to confirm, decide whether the **test** or the **app** is wrong, and fix it.
The answers below are for the trainer.

## Answers

| # | What you see | Root cause | Lesson | Fix |
|---|---|---|---|---|
| 01 | `toHaveText` expected `XOF 1,250,000`, received `XOF 1,240,000` | Wrong expected value in the test | Read expected versus received carefully. Check the requirement before changing the app | Expect `XOF 1,240,000` |
| 02 | Times out waiting for `getByTestId('login-buton')` | Typo in the test id | A timeout on a locator usually means the element is never found. The trace shows the button exists with another id | Use `login-button` |
| 03 | `strict mode violation`: the locator resolved to 3 elements | Three "Add expense" links on Overview (top bar, header, balance card) | Locators must point at exactly one element | Use a unique hook such as `getByTestId('dash-add-expense')` |
| 04 | `toBeHidden` fails, the message is still on screen | The confirmation stays 2.5 seconds, the test assumes 1 | Timing assumptions must come from the spec, not guesses | `runFor(2600)` before checking |
| 05 | Card shows "Close to limit", test expects "Over budget" | The requirement is: 75% to 99% is "Close to limit", 100% and more is "Over budget" | Test the requirement, not your memory of it. Here the app is right | Expect "Close to limit", or add 80,000 for "Over budget" |
| 06 | Expected 1 expense row, found 0 | `page.goto()` reloads the app, and data lives in memory | Tests must not rely on state lost between steps. The video shows the reload | Navigate with in-app links instead of `goto` |
| 07 | Expected `1 entries`, received `0 entries` | The text was read once, before the expense was added | `textContent()` is a snapshot. Web-first assertions retry until the page catches up | `await expect(tid('expense-count')).toHaveText('1 entries')` after adding |
| 08 | Two failures reported in one test | Soft assertions keep going after a failure. Income is 450,000 and the savings rate starts at 100% | Use `expect.soft` to collect several checks in one run | Fix both expected values |
| 09 | Sidebar not visible | On phone sizes the sidebar is replaced by bottom navigation, by design | Know the responsive behaviour before writing layout tests | Expect `.z-bottom` to be visible on small screens |
| 10 | Shows as **flaky**: first attempt times out, retry passes | Simulated slow environment on the first attempt | What "flaky" means in the report, why retries hide problems, and how to read both attempts | Remove the artificial delay. In real life, find what makes the first attempt slow |
| 11 | Shows as **passed (expected to fail)** | Marked with `test.fail()`: the app clamps the rate at 0% | How to document a known issue without breaking the pipeline | When the product decision is made, remove `test.fail()` and update the assertion |
| 12 | Shows as **skipped** | Marked with `test.fixme()` | How to park a test you haven't written yet | Write the test, then remove `fixme` |

Expected outcome of a full run: 9 failed, 1 flaky, 1 passed (expected failure), 1 skipped.
