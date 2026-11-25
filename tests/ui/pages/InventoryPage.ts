import { type Locator, type Page } from '@playwright/test';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async open() {
    await this.page.goto('/inventory.html');
  }

  /** "Sauce Labs Backpack" -> "sauce-labs-backpack" (формат data-test кнопок saucedemo) */
  static slug(productName: string): string {
    // saucedemo лишає у data-test крапки й дужки ("test.allthethings()-t-shirt-(red)"), міняє лише пробіли
    return productName.toLowerCase().replace(/\s+/g, '-');
  }

  addToCart(productName: string) {
    return this.page.getByTestId(`add-to-cart-${InventoryPage.slug(productName)}`).click();
  }

  /** Додає всі товари каталогу; кнопки шукає за роллю, без залежності від slug назви. */
  async addAllToCart() {
    const addButtons = this.items.getByRole('button', { name: 'Add to cart' });
    const total = await addButtons.count();
    for (let i = 0; i < total; i++) {
      // після кліку кнопка стає "Remove", тож наступна "Add to cart" завжди перша
      await addButtons.first().click();
    }
  }

  removeFromCart(productName: string) {
    return this.page.getByTestId(`remove-${InventoryPage.slug(productName)}`).click();
  }

  async sortBy(option: SortOption) {
    await this.sortSelect.selectOption(option);
  }

  async getNames(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  async getPrices(): Promise<number[]> {
    const raw = await this.itemPrices.allInnerTexts();
    return raw.map((p) => Number(p.replace('$', '')));
  }

  async openCart() {
    await this.cartLink.click();
  }
}
