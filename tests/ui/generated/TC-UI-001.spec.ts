import { test, expect } from '../fixtures';

// Згенеровано з testcases/TC-UI-001-continue-shopping-keeps-cart.md
test('[TC-UI-001] Кнопка "Continue Shopping" повертає в каталог і не втрачає вміст кошика', async ({
  page,
  loggedIn,
  cartPage,
}) => {
  await test.step('додати товар і відкрити кошик', async () => {
    await loggedIn.addToCart('Sauce Labs Backpack');
    await loggedIn.openCart();
  });

  await test.step('натиснути "Continue Shopping"', async () => {
    await cartPage.continueShoppingButton.click();
  });

  await test.step('каталог відкрито, бейдж кошика збережено', async () => {
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(loggedIn.items).toHaveCount(6);
    await expect(loggedIn.cartBadge).toHaveText('1');
  });
});
