import { test, expect } from '../fixtures';

// Згенеровано з testcases/TC-UI-002-remove-item-in-cart.md
const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test('[TC-UI-002] Видалення товару прямо зі сторінки кошика', async ({ loggedIn, cartPage }) => {
  await test.step('додати два товари і відкрити кошик', async () => {
    await loggedIn.addToCart(BACKPACK);
    await loggedIn.addToCart(BIKE_LIGHT);
    await loggedIn.openCart();
    await expect(cartPage.itemNames).toHaveText([BACKPACK, BIKE_LIGHT]);
  });

  await test.step('видалити "Bike Light" у кошику', async () => {
    await cartPage.removeItem(BIKE_LIGHT);
  });

  await test.step('лишився лише "Backpack", бейдж = 1', async () => {
    await expect(cartPage.itemNames).toHaveText([BACKPACK]);
    await expect(loggedIn.cartBadge).toHaveText('1');
  });
});
