import { type Locator, type Page } from '@playwright/test';

/** Опис локатора за роллю: те, що приймає `getByRole(role, { name })`. */
export interface RoleLocator {
  readonly role: Parameters<Page['getByRole']>[0];
  readonly name: string;
}

/** Шукає елемент за описом `RoleLocator` на сторінці або всередині іншого локатора. */
export function byRole(root: Page | Locator, locator: RoleLocator): Locator {
  return root.getByRole(locator.role, { name: locator.name });
}
