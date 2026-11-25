import { test, expect } from './fixtures';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test.describe('Cart', () => {
  test('adding and removing items updates the badge and cart contents', async ({ loggedIn, cartPage }) => {
    await expect(loggedIn.cartBadge).toBeHidden();

    await loggedIn.addToCart(BACKPACK);
    await loggedIn.addToCart(BIKE_LIGHT);
    await expect(loggedIn.cartBadge).toHaveText('2');

    await loggedIn.removeFromCart(BIKE_LIGHT);
    await expect(loggedIn.cartBadge).toHaveText('1');

    await loggedIn.openCart();
    await expect(cartPage.itemNames).toHaveText([BACKPACK]);
  });

  test('cart contents persist after page reload', async ({ page, loggedIn, cartPage }) => {
    await loggedIn.addToCart(BACKPACK);
    await loggedIn.addToCart(BIKE_LIGHT);

    await page.reload();
    await expect(loggedIn.cartBadge).toHaveText('2');

    await cartPage.open();
    await expect(cartPage.itemNames).toHaveText([BACKPACK, BIKE_LIGHT]);
  });
});
