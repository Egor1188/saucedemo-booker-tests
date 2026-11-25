import { test, expect } from '../fixtures';

// Згенеровано з testcases/TC-UI-004-cancel-checkout.md
const PRODUCT = 'Sauce Labs Backpack';

test('[TC-UI-004] Скасування чекауту на першому кроці повертає в кошик зі збереженим вмістом', async ({
  page,
  loggedIn,
  cartPage,
  checkoutPage,
}) => {
  await test.step('додати товар у кошик, відкрити кошик і почати чекаут', async () => {
    await loggedIn.addToCart(PRODUCT);
    await loggedIn.openCart();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  await test.step('натиснути Cancel на формі даних', async () => {
    await checkoutPage.cancelButton.click();
  });

  await test.step('відкрито сторінку кошика', async () => {
    await expect(page).toHaveURL(/cart\.html/);
  });

  await test.step('у кошику лишається доданий товар', async () => {
    await expect(cartPage.itemNames).toHaveText([PRODUCT]);
  });
});
