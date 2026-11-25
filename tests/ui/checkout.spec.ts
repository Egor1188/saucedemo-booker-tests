import { test, expect } from './fixtures';
import { CheckoutPage } from './pages/CheckoutPage';

test.describe('Checkout', () => {
  test('full purchase flow: overview totals match item prices @smoke', async ({
    page,
    loggedIn,
    cartPage,
    checkoutPage,
  }) => {
    const products = ['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket'];

    // ціни беремо з каталогу, а не хардкодимо
    const catalogPrices: number[] = [];
    for (const name of products) {
      const card = loggedIn.items.filter({ hasText: name });
      const price = await card.getByTestId('inventory-item-price').innerText();
      catalogPrices.push(Number(price.replace('$', '')));
      await loggedIn.addToCart(name);
    }
    const expectedSubtotal = catalogPrices.reduce((a, b) => a + b, 0);

    await loggedIn.openCart();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one/);

    await checkoutPage.fillInfo({ firstName: 'Test', lastName: 'User', postalCode: '01001' });
    await expect(page).toHaveURL(/checkout-step-two/);
    await expect(checkoutPage.itemNames).toHaveText(products);

    const subtotal = CheckoutPage.money(await checkoutPage.subtotal.innerText());
    const tax = CheckoutPage.money(await checkoutPage.tax.innerText());
    const total = CheckoutPage.money(await checkoutPage.total.innerText());
    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);

    await checkoutPage.finishButton.click();
    await expect(page).toHaveURL(/checkout-complete/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(loggedIn.cartBadge).toBeHidden();
  });
});
