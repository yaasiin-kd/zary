import { expect } from '@playwright/test';

export const DEMO = { email: 'demo@zary.app', password: 'demo123', name: 'Demo User' };

/** A unique email per test, so tests never depend on each other. */
export const uniqueEmail = (prefix = 'qa') => `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@example.com`;

/**
 * Page object for the Zary app.
 * Groups the actions a user takes so tests read like steps: signIn, addExpense, transfer...
 */
export class ZaryApp {
  constructor(page) {
    this.page = page;
  }

  tid(id) {
    return this.page.getByTestId(id);
  }

  toast() {
    return this.tid('success-toast');
  }

  /* ---------- Sign in and sign up ---------- */

  async openLogin() {
    await this.page.goto('/app/login');
    await expect(this.tid('login-button')).toBeVisible();
  }

  async submitLogin(email, password) {
    await this.tid('email-input').fill(email);
    await this.tid('password-input').fill(password);
    await this.tid('login-button').click();
  }

  async readCode() {
    await expect(this.tid('otp-display')).toHaveText(/^\d{6}$/);
    return (await this.tid('otp-display').textContent()).trim();
  }

  async enterCode(code) {
    const value = code ?? (await this.readCode());
    for (let i = 0; i < value.length; i++) await this.tid(`otp-digit-${i + 1}`).fill(value[i]);
  }

  /** Signs in from scratch and waits for the Overview page. */
  async signIn({ email = DEMO.email, password = DEMO.password } = {}) {
    await this.openLogin();
    await this.submitLogin(email, password);
    await this.enterCode();
    await expect(this.tid('page-dashboard')).toBeVisible();
  }

  async openRegister() {
    await this.page.goto('/app/register');
    await expect(this.tid('register-button')).toBeVisible();
  }

  async submitRegister({ name, email, password }) {
    await this.tid('register-name').fill(name);
    await this.tid('register-email').fill(email);
    await this.tid('register-password').fill(password);
    await this.tid('register-button').click();
  }

  /** Creates an account and goes through onboarding. Returns the account details. */
  async signUp({ name = 'Kofi Mensah', email = uniqueEmail(), password = 'secret12', limits = {} } = {}) {
    await this.openRegister();
    await this.submitRegister({ name, email, password });
    await this.enterCode();
    await expect(this.tid('onboarding')).toBeVisible();
    for (const [field, value] of Object.entries(limits)) await this.tid(`ob-${field}`).fill(String(value));
    await this.tid('ob-next-1').click();
    await this.tid('ob-finish').click();
    await expect(this.tid('page-dashboard')).toBeVisible();
    return { name, email, password };
  }

  async signOut() {
    await this.tid('logout-button').click();
    await expect(this.tid('login-button')).toBeVisible();
  }

  /* ---------- Navigation ---------- */

  async go(section) {
    await this.tid(`nav-${section}`).click();
    await expect(this.tid(`page-${section}`)).toBeVisible();
  }

  async openSettingsTab(tab) {
    await this.go('profile');
    await this.tid(`tab-${tab}`).click();
  }

  /* ---------- Expenses ---------- */

  async addExpense({ desc, amount, cat = 'Food', monthly = false }) {
    await this.tid('expense-description').fill(desc);
    await this.tid('expense-amount').fill(String(amount));
    await this.tid('expense-category').selectOption(cat);
    if (monthly) await this.tid('expense-recurring').check();
    await this.tid('add-expense-button').click();
  }

  /** Adds several expenses quickly from the Expenses page. */
  async addExpenses(list) {
    for (const e of list) {
      await this.addExpense(e);
      await expect(this.tid('expense-description')).toHaveValue('');
    }
  }

  expenseRows() {
    return this.page.locator('[data-testid^="expense-row-"]');
  }

  /* ---------- Transfers ---------- */

  async transfer(amount, note) {
    await this.tid('transfer-amount').fill(String(amount));
    if (note) await this.tid('transfer-note').fill(note);
    await this.tid('transfer-button').click();
  }

  /* ---------- Dialog ---------- */

  async confirm() {
    await expect(this.tid('confirm-dialog')).toBeVisible();
    await this.tid('confirm-accept').click();
    await expect(this.tid('confirm-dialog')).toBeHidden();
  }

  async theme() {
    return this.page.locator('.za').getAttribute('data-theme');
  }
}

/*
 * Note for test authors: accounts and data live in memory.
 * page.goto() reloads the app and resets everything except the theme,
 * so within one test, move between screens with in-app links when earlier data matters.
 */
