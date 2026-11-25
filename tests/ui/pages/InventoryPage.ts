import { type Locator, type Page } from '@playwright/test';
import { InventoryLocators, InventoryRoles } from '../locators/InventoryLocators';
import { byRole } from '../locators/byRole';

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
    this.title = page.getByTestId(InventoryLocators.Title);
    this.items = page.getByTestId(InventoryLocators.Item);
    this.itemNames = page.getByTestId(InventoryLocators.ItemName);
    this.itemPrices = page.getByTestId(InventoryLocators.ItemPrice);
    this.sortSelect = page.getByTestId(InventoryLocators.SortSelect);
    this.cartBadge = page.getByTestId(InventoryLocators.CartBadge);
    this.cartLink = page.getByTestId(InventoryLocators.CartLink);
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
    return this.page.getByTestId(`${InventoryLocators.AddToCartPrefix}${InventoryPage.slug(productName)}`).click();
  }

  /** Додає всі товари каталогу; кнопки шукає за роллю, без залежності від slug назви. */
  async addAllToCart() {
    const addButtons = byRole(this.items, InventoryRoles.AddToCartButton);
    const total = await addButtons.count();
    for (let i = 0; i < total; i++) {
      // після кліку кнопка стає "Remove", тож наступна "Add to cart" завжди перша
      await addButtons.first().click();
    }
  }

  removeFromCart(productName: string) {
    return this.page.getByTestId(`${InventoryLocators.RemovePrefix}${InventoryPage.slug(productName)}`).click();
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
