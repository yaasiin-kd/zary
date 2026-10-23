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

End-to-end tests use [Playwright](https://playwright.dev): 137 tests in `tests/e2e`, run on every pull request and push to `main` by GitHub Actions.

```bash
npx playwright install        # first time only
npm run test:e2e              # full suite
npm run test:e2e:smoke        # 15 critical paths
npm run test:e2e:ui           # interactive mode
npm run test:e2e:report       # last HTML report
```

**See [docs/QA.md](docs/QA.md)** for the complete QA guide: setup, every script and option, what each spec covers, the page object, how to write and debug tests, the CI pipeline, the training suite, maintenance and a quick reference of test data, rules and test ids.
