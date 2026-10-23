# Zary

Zary is a personal finance web app for tracking expenses, budgets and savings, with amounts in West African CFA francs by default. It includes a landing page with a 3D hero scene and the full app, built with React.

## Tech stack

- React 18 with React Router
- Vite for development and builds
- three.js for the landing page hero scene
- Plain CSS, scoped per area (`.lp` for the landing page, `.za` for the app)

## Project structure

```
zary/
├── index.html                 Vite entry, favicon and fonts
├── public/                    Favicon and home-screen icon
├── vercel.json                Rewrites so app routes work on refresh
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
- Expenses with categories, monthly recurring flag, search, filters, pagination and CSV export
- Undo for adding and removing expenses
- Budget limits per category with warnings at 75%
- Transfers between main and savings accounts
- Profile and settings, dark and light mode, collapsible sidebar, mobile bottom navigation
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

## Deploy on Vercel

1. On vercel.com, choose **Add New**, then **Project**
2. Import the `zary` repository
3. Vercel detects Vite automatically: build command `npm run build`, output directory `dist`
4. Click **Deploy**

Every push to `main` deploys automatically. `vercel.json` makes sure routes like `/app/dashboard` load correctly on refresh.

## Testing

Every interactive element has a `data-testid` attribute, ready for end-to-end tests with Playwright. For example `email-input`, `login-button`, `otp-digit-1` to `otp-digit-6`, `otp-display`, `add-expense-button`, `pagination-next`, `transfer-button` and `logout-button`.
