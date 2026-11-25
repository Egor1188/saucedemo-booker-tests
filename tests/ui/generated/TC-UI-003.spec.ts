import { test, expect } from '../fixtures';

// Згенеровано з testcases/TC-UI-003-add-all-products.md
const CATALOG_SIZE = 6;

test('[TC-UI-003] Додавання всіх товарів каталогу в кошик', async ({ loggedIn, cartPage }) => {
  let catalogNames: string[] = [];

  await test.step('додати в кошик усі товари каталогу', async () => {
    await expect(loggedIn.items).toHaveCount(CATALOG_SIZE);
    catalogNames = await loggedIn.getNames();
    await loggedIn.addAllToCart();
  });

  await test.step('бейдж кошика показує кількість товарів каталогу', async () => {
    await expect(loggedIn.cartBadge).toHaveText(String(CATALOG_SIZE));
  });

  await test.step('відкрити кошик: ті самі товари в тому ж порядку', async () => {
    await loggedIn.openCart();
    await expect(cartPage.itemNames).toHaveText(catalogNames);
  });
});
