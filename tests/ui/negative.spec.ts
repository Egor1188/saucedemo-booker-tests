import { test, expect, USERS, PASSWORD } from './fixtures';

test.describe('Негативні та граничні сценарії', () => {
  const loginCases = [
    {
      title: 'заблокований користувач',
      username: USERS.lockedOut,
      password: PASSWORD,
      error: 'Epic sadface: Sorry, this user has been locked out.',
    },
    {
      title: 'невірний пароль',
      username: USERS.standard,
      password: 'wrong_password',
      error: 'Epic sadface: Username and password do not match any user in this service',
    },
    {
      title: 'порожній логін',
      username: '',
      password: PASSWORD,
      error: 'Epic sadface: Username is required',
    },
    {
      title: 'порожній пароль',
      username: USERS.standard,
      password: '',
      error: 'Epic sadface: Password is required',
    },
  ];

  for (const c of loginCases) {
    test(`логін не проходить: ${c.title}`, async ({ page, loginPage }) => {
      await loginPage.open();
      await loginPage.login(c.username, c.password);

      await expect(loginPage.error).toHaveText(c.error);
      await expect(page).not.toHaveURL(/inventory/);
    });
  }

  test('прямий перехід у каталог без логіну блокується', async ({ page, inventoryPage }) => {
    await inventoryPage.open();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.getByTestId('error')).toContainText(
      "You can only access '/inventory.html' when you are logged in",
    );
  });

  test('чекаут не пускає далі без поштового індексу', async ({ page, loggedIn, cartPage, checkoutPage }) => {
    await loggedIn.addToCart('Sauce Labs Onesie');
    await loggedIn.openCart();
    await cartPage.checkout();

    await checkoutPage.fillInfo({ firstName: 'Test', lastName: 'User' });

    await expect(checkoutPage.error).toHaveText('Error: Postal Code is required');
    await expect(page).toHaveURL(/checkout-step-one/);
  });

  test('BUG-UI-01: не можна оформити замовлення з порожнім кошиком', async ({
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
