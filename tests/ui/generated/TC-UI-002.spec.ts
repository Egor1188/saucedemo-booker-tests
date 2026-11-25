import { test, expect } from '../fixtures';

// Згенеровано з testcases/TC-UI-002-cancel-checkout.md
const PRODUCT = 'Sauce Labs Backpack';

test('[TC-UI-002] Cancelling checkout on step one returns to the cart with its contents preserved', async ({
  page,
  loggedIn,
  cartPage,
  checkoutPage,
}) => {
  await test.step('add a product, open the cart and start checkout', async () => {
    await loggedIn.addToCart(PRODUCT);
    await loggedIn.openCart();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  await test.step('click Cancel on the customer info form', async () => {
    await checkoutPage.cancelButton.click();
  });

  await test.step('cart page is open', async () => {
    await expect(page).toHaveURL(/cart\.html/);
  });

  await test.step('the added product remains in the cart', async () => {
    await cartPage.expectItems([PRODUCT]);
  });
});
