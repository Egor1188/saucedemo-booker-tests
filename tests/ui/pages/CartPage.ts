import { type Locator, type Page } from '@playwright/test';
import { InventoryPage } from './InventoryPage';

export class CartPage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async open() {
    await this.page.goto('/cart.html');
  }

  removeItem(productName: string) {
    return this.page.getByTestId(`remove-${InventoryPage.slug(productName)}`).click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
