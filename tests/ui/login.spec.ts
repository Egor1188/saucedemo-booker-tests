import { test, expect, USERS, PASSWORD } from './fixtures';

test.describe('Логін', () => {
  test('standard_user логіниться і бачить каталог @smoke', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.open();
    await loginPage.login(USERS.standard, PASSWORD);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('сесія живе в cookie і вихід її скидає', async ({ page, loggedIn }) => {
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByTestId('logout-sidebar-link').click();

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    // після логауту назад у каталог не пускає
    await loggedIn.open();
    await expect(page.getByTestId('error')).toContainText(
      "You can only access '/inventory.html' when you are logged in",
    );
  });
});
