import { test, expect } from '../fixtures';

// Згенеровано з testcases/TC-UI-001-add-all-products.md
const CATALOG_SIZE = 6;

test('[TC-UI-001] Add all catalog products to the cart', async ({ loggedIn, cartPage }) => {
  let catalogNames: string[] = [];

  await test.step('add all catalog products to the cart', async () => {
    await expect(loggedIn.items).toHaveCount(CATALOG_SIZE);
    catalogNames = await loggedIn.getNames();
    await loggedIn.addAllToCart();
  });

  await test.step('cart badge shows the catalog product count', async () => {
    await expect(loggedIn.cartBadge).toHaveText(String(CATALOG_SIZE));
  });

  await test.step('open the cart: same products in the same order', async () => {
    await loggedIn.openCart();
    await expect(cartPage.itemNames).toHaveText(catalogNames);
  });
});
