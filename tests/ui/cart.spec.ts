import { test } from './fixtures';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test.describe('Cart', () => {
  test('adding and removing items updates the badge and cart contents', async ({ loggedIn, cartPage }) => {
    await loggedIn.expectCartCount(0);

    await loggedIn.addToCart(BACKPACK);
    await loggedIn.addToCart(BIKE_LIGHT);
    await loggedIn.expectCartCount(2);

    await loggedIn.removeFromCart(BIKE_LIGHT);
    await loggedIn.expectCartCount(1);

    await loggedIn.openCart();
    await cartPage.expectItems([BACKPACK]);
  });

  test('cart contents persist after page reload', async ({ page, loggedIn, cartPage }) => {
    await loggedIn.addToCart(BACKPACK);
    await loggedIn.addToCart(BIKE_LIGHT);

    await page.reload();
    await loggedIn.expectCartCount(2);

    await cartPage.open();
    await cartPage.expectItems([BACKPACK, BIKE_LIGHT]);
  });
});
