import { test, expect, USERS, PASSWORD } from './fixtures';
import { InventoryLocators, InventoryRoles } from './locators/InventoryLocators';
import { byRole } from './locators/byRole';
import { LoginLocators } from './locators/LoginLocators';

test.describe('Login', () => {
  test('standard_user logs in and sees the catalog @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.open();
    await loginPage.login(USERS.standard, PASSWORD);

    await inventoryPage.expectOpen();
  });

  test('session lives in a cookie and logout clears it', async ({ page, loggedIn }) => {
    await byRole(page, InventoryRoles.OpenMenuButton).click();
    await page.getByTestId(InventoryLocators.LogoutLink).click();

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    // після логауту назад у каталог не пускає
    await loggedIn.open();
    await expect(page.getByTestId(LoginLocators.Error)).toContainText(
      "You can only access '/inventory.html' when you are logged in",
    );
  });
});
