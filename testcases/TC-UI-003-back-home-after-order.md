---
id: TC-UI-003
title: After an order, "Back Home" leads to the catalog with an empty cart
area: ui
priority: medium
---

## Передумови
- Залогінений standard_user.

## Кроки
1. Додати в кошик "Sauce Labs Onesie".
2. Пройти чекаут із довільними валідними даними до сторінки "Thank you for your order!".
3. Натиснути "Back Home".

## Очікуваний результат
- Відкрито сторінку каталогу.
- Бейдж кошика не відображається.
