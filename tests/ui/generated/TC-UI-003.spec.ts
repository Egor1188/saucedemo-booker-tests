import { test, expect } from '../fixtures';

// Згенеровано з testcases/TC-UI-003-back-home-after-order.md
const PRODUCT = 'Sauce Labs Onesie';

test('[TC-UI-003] After an order, "Back Home" leads to the catalog with an empty cart', async ({
  page,
  loggedIn,
  cartPage,
  checkoutPage,
}) => {
  await test.step('add a product and complete checkout up to the thank-you page', async () => {
    await loggedIn.addToCart(PRODUCT);
    await loggedIn.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo({ firstName: 'Ivan', lastName: 'Petrenko', postalCode: '01001' });
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await checkoutPage.finishButton.click();
    await checkoutPage.expectOrderComplete();
  });

  await test.step('click Back Home', async () => {
    await checkoutPage.backHomeButton.click();
  });

  await test.step('catalog page is open', async () => {
    await loggedIn.expectOpen();
  });

  await test.step('cart badge is not displayed', async () => {
    await loggedIn.expectCartCount(0);
  });
});
