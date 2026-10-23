# Zary

Zary is a personal finance web app for tracking expenses, budgets and savings, with amounts in West African CFA francs by default. It includes a landing page with a 3D hero scene and the full app, built with React.

## Tech stack

- React 18 with React Router
- Vite for development and builds
- three.js for the landing page hero scene
- Plain CSS with design tokens, scoped per area (`.lp` for the landing page, `.za` for the app)

## Project structure

```
zary/
├── index.html                 Vite entry, favicon and fonts
├── public/                    Favicon and home-screen icon
├── netlify.toml               Build settings and redirects for Netlify
└── src/
    ├── main.jsx               App bootstrap
    ├── App.jsx                Top-level routes (landing and app, code-split)
    ├── components/            Logo and icons
    ├── landing/
    │   ├── Landing.jsx        Landing page
    │   ├── heroScene.js       three.js banknote and coins
    │   ├── sectionAnimations.js  Scroll-triggered animations
    │   └── guilloche.js       Engraved line patterns
    ├── app/
    │   ├── ui/                Design system: tokens, components and icons
    │   ├── ZaryApp.jsx        App routes and guards
    │   ├── store.jsx          App state and actions
    │   ├── Shell.jsx          Sidebar, bottom nav, session timeout
    │   ├── Toast.jsx          Notifications with undo
    │   ├── auth/              Sign in, sign up, code verification, onboarding
    │   └── pages/             Dashboard, Expenses, Budget, Transfer, Profile
    └── styles/                Base, landing and app styles
```

## Routes

| Path | Screen |
| --- | --- |
| `/` | Landing page |
| `/app/login` | Sign in |
| `/app/register` | Create account |
| `/app/verify` | Six-digit code verification |
| `/app/welcome` | Onboarding for new accounts |
| `/app/dashboard` | Dashboard |
| `/app/expenses` | Expenses |
| `/app/budget` | Budget |
| `/app/transfer` | Transfer |
| `/app/profile` | Profile and settings |

App pages redirect to sign-in when nobody is signed in.

## Features

- Sign up and sign in with a six-digit one-time code (with expiry, resend and paste support)
- Three-step onboarding to set monthly budgets and currency
- Dashboard with balance, income, expenses and savings rate
- Expenses with categories, monthly recurring flag, field-level validation, search, filters, pagination and CSV export
- Undo for adding and removing expenses
- Budget limits per category, editable in place, with warnings at 75%
- Transfers in both directions between main and savings, with quick amounts
- Settings in tabs (profile, security with password strength, preferences, account) with confirmation dialogs
- Dark and light mode, collapsible sidebar that remembers its state, mobile bottom navigation
- Automatic sign-out after 5 minutes of inactivity, with a one-minute warning

## Demo account

- Email: `demo@zary.app`
- Password: `demo123`

The one-time code is shown on the verification screen. Data is kept in memory, so refreshing the page signs you out.

## Getting started

Requires Node.js 18 or later.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

```bash
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

## Deploy on Netlify

1. On app.netlify.com, choose **Add new site**, then **Import an existing project**
2. Connect GitHub and pick the `zary` repository
3. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `dist`, Node 20
4. Click **Deploy**

Every push to `main` deploys automatically. The redirect rule in `netlify.toml` makes sure routes like `/app/dashboard` load correctly on refresh.

## Testing

End-to-end tests use [Playwright](https://playwright.dev) and live in `tests/e2e`.

```
tests/e2e/
├── fixtures.js            `app` and `signedIn` fixtures
├── support/app.js         Page object with the actions a user takes (signIn, addExpense, transfer...)
├── routing.spec.js        Redirects and protected pages
├── landing.spec.js        Landing page links, FAQ, WebGL and reduced-motion fallbacks
├── auth-signin.spec.js    Sign in
├── auth-verify.spec.js    Six-digit code, paste, resend and expiry
├── auth-signup.spec.js    Sign up and onboarding
├── navigation.spec.js     Sidebar, top bar and sign out
├── dashboard.spec.js      Overview figures, activity and budget health
├── expenses.spec.js       Add, delete, undo, validation, search, filters, pagination, CSV
├── budget.spec.js         Status thresholds, editing limits, summary
├── transfer.spec.js       Both directions, validation, quick amounts, history
├── settings.spec.js       Profile, password, preferences, account actions
├── session.spec.js        Idle timeout and warning
├── responsive.spec.js     Phone layout (runs in the mobile project)
└── accessibility.spec.js  axe WCAG 2.1 AA scans and a keyboard-only flow
```

Tests tagged `@smoke` form the quick suite. Timers (code expiry, undo, session timeout) use Playwright's clock control, so nothing waits in real time.

```bash
npx playwright install        # first time only, downloads the browsers
npm run test:e2e              # everything
npm run test:e2e:smoke        # smoke suite only
npm run test:e2e:ui           # interactive mode
npm run test:e2e:report       # open the last HTML report
```

The tests build the app and start `vite preview` on port 4173 automatically.

### Projects

| Project | Runs |
| --- | --- |
| `chromium` | Full suite on desktop Chrome |
| `mobile` | Phone layout checks on a Pixel 7 viewport |
| `firefox`, `webkit` | Smoke suite only |

### Continuous integration

`.github/workflows/e2e.yml` runs on every pull request to `main`, every push to `main`, and on demand. It runs two jobs in parallel: the full suite in Chromium (desktop and phone), and the smoke suite in Firefox and WebKit. The HTML report is attached to each run as an artifact. To block merging when tests fail, make these checks required in the branch protection rules for `main`.

### Writing tests

Accounts and data live in memory, so `page.goto()` reloads the app and resets everything except the theme. When a test needs earlier data, move between screens with in-app links. Every interactive element has a `data-testid`; prefer `getByTestId` or `getByRole` over CSS selectors.
