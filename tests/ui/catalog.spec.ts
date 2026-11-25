import { test, expect } from './fixtures';
import type { SortOption } from './pages/InventoryPage';
import { InventoryLocators, InventoryRoles } from './locators/InventoryLocators';
import { byRole } from './locators/byRole';

test.describe('Catalog', () => {
  test('every product card has a name, description, price and an "Add to cart" button', async ({ loggedIn }) => {
    const count = await loggedIn.items.count();
    expect(count).toBe(6);

    for (const item of await loggedIn.items.all()) {
      await expect(item.getByTestId(InventoryLocators.ItemName)).not.toBeEmpty();
      await expect(item.getByTestId(InventoryLocators.ItemDesc)).not.toBeEmpty();
      await expect(item.getByTestId(InventoryLocators.ItemPrice)).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(byRole(item, InventoryRoles.AddToCartButton)).toBeVisible();
    }
  });
});

test.describe('Sorting', () => {
  const byName = (a: string, b: string) => a.localeCompare(b);
  const cases: { option: SortOption; title: string; field: 'name' | 'price'; desc: boolean }[] = [
    { option: 'az', title: 'Name (A to Z)', field: 'name', desc: false },
    { option: 'za', title: 'Name (Z to A)', field: 'name', desc: true },
    { option: 'lohi', title: 'Price (low to high)', field: 'price', desc: false },
    { option: 'hilo', title: 'Price (high to low)', field: 'price', desc: true },
  ];

  for (const c of cases) {
    test(`sorting by "${c.title}"`, async ({ loggedIn }) => {
      await loggedIn.sortBy(c.option);

      if (c.field === 'name') {
        const actual = await loggedIn.getNames();
        const expected = [...actual].sort(byName);
        if (c.desc) expected.reverse();
        expect(actual).toEqual(expected);
      } else {
        const actual = await loggedIn.getPrices();
        const expected = [...actual].sort((a, b) => (c.desc ? b - a : a - b));
        expect(actual).toEqual(expected);
      }
      // обраний пункт відображається в селекті
      await expect(loggedIn.sortSelect).toHaveValue(c.option);
    });
  }
});
