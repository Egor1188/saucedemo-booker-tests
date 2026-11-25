/** Значення атрибута `data-test` на сторінці каталогу (і в її шапці/меню). */
export enum InventoryLocators {
  Title = 'title',
  Item = 'inventory-item',
  ItemName = 'inventory-item-name',
  ItemDesc = 'inventory-item-desc',
  ItemPrice = 'inventory-item-price',
  SortSelect = 'product-sort-container',
  CartBadge = 'shopping-cart-badge',
  CartLink = 'shopping-cart-link',
  LogoutLink = 'logout-sidebar-link',
  /** Префікс: повний data-test = `add-to-cart-<slug назви товару>` */
  AddToCartPrefix = 'add-to-cart-',
  /** Префікс: повний data-test = `remove-<slug назви товару>` */
  RemovePrefix = 'remove-',
}
