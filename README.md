# Zary

Zary is a personal finance web app for tracking expenses, budgets and savings, with amounts in West African CFA francs by default.

## What's inside

```
zary/
├── index.html        Landing page
└── app/
    └── index.html    The Zary app
```

Both pages are static HTML with no build step. Fonts load from Google Fonts and the landing page loads three.js from cdnjs.

## Features

- Sign up and sign in with a six-digit one-time code
- Three-step onboarding to set monthly budgets and currency
- Dashboard with balance, income, expenses and savings rate
- Expenses with categories, monthly recurring flag, search, filters, pagination and CSV export
- Budget limits per category with warnings at 75%
- Transfers between main and savings accounts
- Profile and settings, dark and light mode, collapsible sidebar
- Automatic sign-out after inactivity, with a one-minute warning

## Demo account

- Email: `demo@zary.app`
- Password: `demo123`

The one-time code is shown on the verification screen.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

Then visit http://localhost:3000.

## Deploy on Vercel

1. Go to vercel.com, choose **Add New**, then **Project**
2. Import the `zary` repository
3. Set **Framework Preset** to **Other**, and leave the build command and output directory empty
4. Click **Deploy**

Every push to `main` deploys automatically.

## Testing

Every interactive element in the app has a `data-testid` attribute, ready for end-to-end tests with Playwright.
