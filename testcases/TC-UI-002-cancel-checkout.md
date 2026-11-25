---
id: TC-UI-002
title: Cancelling checkout on step one returns to the cart with its contents preserved
area: ui
priority: medium
---

## Передумови
- Залогінений standard_user.

## Кроки
1. Додати в кошик "Sauce Labs Backpack".
2. Відкрити кошик і натиснути Checkout.
3. На формі даних натиснути Cancel.

## Очікуваний результат
- Відкрито сторінку кошика.
- У кошику лишається "Sauce Labs Backpack".
