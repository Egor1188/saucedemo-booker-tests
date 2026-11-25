import { expect, type Locator, type Page } from '@playwright/test';
import { CheckoutLocators } from '../locators/CheckoutLocators';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByTestId(CheckoutLocators.FirstName);
    this.lastName = page.getByTestId(CheckoutLocators.LastName);
    this.postalCode = page.getByTestId(CheckoutLocators.PostalCode);
    this.continueButton = page.getByTestId(CheckoutLocators.ContinueButton);
    this.cancelButton = page.getByTestId(CheckoutLocators.CancelButton);
    this.error = page.getByTestId(CheckoutLocators.Error);
    this.itemNames = page.getByTestId(CheckoutLocators.ItemName);
    this.itemPrices = page.getByTestId(CheckoutLocators.ItemPrice);
    this.subtotal = page.getByTestId(CheckoutLocators.Subtotal);
    this.tax = page.getByTestId(CheckoutLocators.Tax);
    this.total = page.getByTestId(CheckoutLocators.Total);
    this.finishButton = page.getByTestId(CheckoutLocators.FinishButton);
    this.completeHeader = page.getByTestId(CheckoutLocators.CompleteHeader);
    this.backHomeButton = page.getByTestId(CheckoutLocators.BackHomeButton);
  }

  async fillInfo(info: Partial<CustomerInfo>) {
    if (info.firstName !== undefined) await this.firstName.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastName.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCode.fill(info.postalCode);
    await this.continueButton.click();
  }

  /** "Item total: $39.98" -> 39.98 */
  static money(text: string): number {
    const m = text.match(/\$(\d+(?:\.\d+)?)/);
    if (!m) throw new Error(`Cannot parse money from "${text}"`);
    return Number(m[1]);
  }

  /** Замовлення оформлено: сторінка завершення з повідомленням подяки. */
  async expectOrderComplete() {
    await expect(this.page).toHaveURL(/checkout-complete/);
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}
