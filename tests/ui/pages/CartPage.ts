import { expect, type Locator, type Page } from '@playwright/test';
import { CartLocators } from '../locators/CartLocators';

export class CartPage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId(CartLocators.Item);
    this.itemNames = page.getByTestId(CartLocators.ItemName);
    this.checkoutButton = page.getByTestId(CartLocators.CheckoutButton);
    this.continueShoppingButton = page.getByTestId(CartLocators.ContinueShoppingButton);
  }

  async open() {
    await this.page.goto('/cart.html');
  }

  async checkout() {
    await this.checkoutButton.click();
  }

  /** У кошику рівно ці товари в цьому порядку. */
  async expectItems(names: string[]) {
    await expect(this.itemNames).toHaveText(names);
  }
}
