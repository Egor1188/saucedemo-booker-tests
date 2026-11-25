import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

export const USERS = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
} as const;
// Публічний пароль демо-сайту, показаний прямо на сторінці логіну — не секрет.
export const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** Вже залогінений standard_user на сторінці каталогу */
  loggedIn: InventoryPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  loggedIn: async ({ page, loginPage, inventoryPage }, use) => {
    await loginPage.open();
    await loginPage.login(USERS.standard, PASSWORD);
    await expect(page).toHaveURL(/inventory\.html/);
    await use(inventoryPage);
  },
});

export { expect };
