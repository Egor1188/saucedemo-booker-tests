import { test, expect } from '../fixtures';

// Згенеровано з testcases/TC-UI-003-back-home-after-order.md
const PRODUCT = 'Sauce Labs Onesie';

test('[TC-UI-003] Після завершення замовлення "Back Home" веде в каталог з порожнім кошиком', async ({
  page,
  loggedIn,
  cartPage,
  checkoutPage,
}) => {
  await test.step('додати товар у кошик і пройти чекаут до сторінки подяки', async () => {
    await loggedIn.addToCart(PRODUCT);
    await loggedIn.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo({ firstName: 'Ivan', lastName: 'Petrenko', postalCode: '01001' });
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await checkoutPage.finishButton.click();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  await test.step('натиснути Back Home', async () => {
    await checkoutPage.backHomeButton.click();
  });

  await test.step('відкрито сторінку каталогу', async () => {
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(loggedIn.items).toHaveCount(6);
  });

  await test.step('бейдж кошика не відображається', async () => {
    await expect(loggedIn.cartBadge).toBeHidden();
  });
});
