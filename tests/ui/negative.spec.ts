import { test, expect, USERS, PASSWORD } from './fixtures';

test.describe('Negative and edge cases', () => {
  const loginCases = [
    {
      title: 'locked-out user',
      username: USERS.lockedOut,
      password: PASSWORD,
      error: 'Epic sadface: Sorry, this user has been locked out.',
    },
    {
      title: 'wrong password',
      username: USERS.standard,
      password: 'wrong_password',
      error: 'Epic sadface: Username and password do not match any user in this service',
    },
    {
      title: 'empty username',
      username: '',
      password: PASSWORD,
      error: 'Epic sadface: Username is required',
    },
    {
      title: 'empty password',
      username: USERS.standard,
      password: '',
      error: 'Epic sadface: Password is required',
    },
  ];

  for (const c of loginCases) {
    test(`login fails: ${c.title}`, async ({ page, loginPage }) => {
      await loginPage.open();
      await loginPage.login(c.username, c.password);

      await expect(loginPage.error).toHaveText(c.error);
      await expect(page).not.toHaveURL(/inventory/);
    });
  }

  test('direct navigation to the catalog without login is blocked', async ({ page, inventoryPage }) => {
    await inventoryPage.open();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.getByTestId('error')).toContainText(
      "You can only access '/inventory.html' when you are logged in",
    );
  });

  test('checkout does not proceed without a postal code', async ({ page, loggedIn, cartPage, checkoutPage }) => {
    await loggedIn.addToCart('Sauce Labs Onesie');
    await loggedIn.openCart();
    await cartPage.checkout();

    await checkoutPage.fillInfo({ firstName: 'Test', lastName: 'User' });

    await expect(checkoutPage.error).toHaveText('Error: Postal Code is required');
    await expect(page).toHaveURL(/checkout-step-one/);
  });

  test('BUG-UI-01: an order cannot be placed with an empty cart', async ({
    page,
    loggedIn,
    cartPage,
    checkoutPage,
  }) => {
    // Відомий баг (див. README → BUG-UI-01). test.fail() робить тест "очікувано падаючим":
    // прогін зелений, поки баг живий, і почервоніє, коли баг полагодять — сигнал прибрати маркер.
    test.fail(true, 'BUG-UI-01: чекаут дозволено з порожнім кошиком');

    await loggedIn.openCart();
    await expect(cartPage.items).toHaveCount(0);
    await cartPage.checkout();
    await checkoutPage.fillInfo({ firstName: 'Test', lastName: 'User', postalCode: '01001' });

    // Очікування: користувача не пускають на overview / показують помилку
    await expect(page).not.toHaveURL(/checkout-step-two/, { timeout: 2_000 });
  });
});
