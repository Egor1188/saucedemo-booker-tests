# saucedemo + restful-booker: автотести на Playwright / TypeScript

Тестове завдання QA Automation Engineer (Middle): UI-тести для [saucedemo.com](https://www.saucedemo.com), API-тести для [restful-booker](https://restful-booker.herokuapp.com/apidoc), CI у GitHub Actions. Тести писались у парі з AI-агентом — див. [AI_WORKLOG.md](./AI_WORKLOG.md) та [CLAUDE.md](./CLAUDE.md).

## Як запустити

Потрібен Node.js 20+.

```bash
npm ci
npx playwright install chromium   # лише для UI

npm test              # усе
npm run test:ui       # тільки saucedemo
npm run test:api      # тільки restful-booker
npm run report        # відкрити HTML-звіт
npm run typecheck     # перевірка типів
```

Облікові дані публічні й зашиті як дефолти; за потреби перевизначаються змінними `SAUCE_PASSWORD`, `BOOKER_USER`, `BOOKER_PASSWORD`.

**CI:** `.github/workflows/tests.yml` запускається на кожен push і PR, окремими джобами для `ui` і `api`. HTML-звіт (`playwright-report-*`) і traces/скріншоти/JUnit (`test-results-*`) завантажуються як артефакти навіть при падінні. Крім того, після кожного push у `main` HTML-звіти публікуються на GitHub Pages і відкриваються за посиланням без скачування: https://egor1188.github.io/saucedemo-booker-tests/ (ui: `/ui/`, api: `/api/`).

## Структура

```
testcases/           текстові тест-кейси (вхід конвеєра)
scripts/             check-testcases.mjs — перевірка простежуваності й правил
tests/
  ui/
    pages/            Page Object: Login, Inventory, Cart, Checkout
    locators/         по enum-у з data-test на кожен Page Object (LoginLocators, ...);
                      локатори за роллю — обʼєкти { role, name } (InventoryRoles) + хелпер byRole()
    fixtures.ts       фікстури сторінок + loggedIn (залогінений standard_user)
    login.spec.ts     catalog.spec.ts   cart.spec.ts   checkout.spec.ts
    negative.spec.ts
    generated/        тести, згенеровані з testcases/ (теги [TC-UI-NNN])
  api/
    bookingClient.ts  обгортка над API + фабрика тестових даних
    booking-flow.spec.ts
    booking-negative.spec.ts
```

## Що покрито

### UI — saucedemo (standard_user)
| Область | Сценарій |
|---|---|
| Логін | успішний логін → каталог з 6 товарів; логаут скидає сесію |
| Каталог | кожна картка має назву, опис, ціну у форматі `$X.XX`, кнопку «Add to cart» |
| Сортування | A→Z, Z→A, ціна ↑, ціна ↓ (4 параметризовані тести, порядок перевіряється відносно відсортованої копії, а не хардкоду) |
| Кошик | додавання/видалення оновлює бейдж і вміст; кошик переживає перезавантаження |
| Чекаут | повний флоу; subtotal = сума цін з каталогу, total = subtotal + tax; після покупки кошик порожній |
| Негативні | locked_out_user, невірний пароль, порожній логін/пароль; прямий перехід у каталог без логіну; чекаут без поштового індексу; чекаут з порожнім кошиком (баг) |

### API — restful-booker
| Сценарій | Перевірки |
|---|---|
| CRUD-флоу | auth → create → PUT → PATCH → delete → GET 404; дані після create/update звіряються через GET |
| Негативні | невірні облікові дані не дають токена; PUT/DELETE без токена і з невалідним токеном → 403 і дані не змінились; неіснуючий id → 404; тіло без обовʼязкових полів (баг) |

**Про кількість тестів.** Завдання просить 5–7 позитивних і 2–3 негативних UI-тестів та 2–3 негативних API-кейси; фактично `playwright test` показує більше, і це свідомо:
- За **сценаріями** укладаємось у ліміт. UI-позитивних 7: логін, сесія/логаут, каталог, сортування, додавання/видалення в кошику, збереження кошика, чекаут. UI-негативних 3: невалідний логін, доступ без логіну, валідація форми чекауту. API-негативних 3: невірні облікові дані, запити без токена, неіснуючий id.
- Решта — **параметризація**, а не нові сценарії: сортування це 4 тести одного сценарію (по одному на опцію), невалідний логін — 4 варіанти (заблокований, невірний пароль, порожній логін, порожній пароль).
- Ще 5 тестів (BUG-UI-01, BUG-API-01/02/03/04) — це знайдені баги: за правилом проєкту їх не маскують, а лишають із правильним очікуванням і `test.fail()`.
- 3 тести `[TC-UI-001..003]` у `tests/ui/generated/` — результат бонусного конвеєра, див. нижче.

Тести з відомими багами позначені `test.fail()`: прогін лишається зеленим, поки баг відтворюється, а коли його полагодять — тест почервоніє і нагадає зняти маркер.

## Що свідомо не покрито
- **Інші користувачі saucedemo** (`problem_user`, `performance_glitch_user`, `error_user`, `visual_user`) — завдання про `standard_user`; негативний логін через `locked_out_user` — виняток.
- **Крос-браузерність і мобільні вʼюпорти** — лише Chromium, щоб CI був швидким. Додати Firefox/WebKit — один рядок у `projects`.
- **Візуальне регресійне тестування, a11y, продуктивність.**
- **Сторінка деталей товару, меню «About» / «Reset App State»**, футер і соцмережі.
- **API: фільтри `GET /booking?firstname=...&checkin=...`, `/ping`, XML-формат, Basic-auth** як альтернатива cookie-токену. Фільтри ненадійні на спільному публічному стенді: дані інших користувачів і скидання бази кожні ~10 хв роблять очікування на списки флейковими.
- **Граничні значення полів бронювання** (від'ємна ціна, checkout раніше checkin, дуже довгі рядки) — кандидати на наступну ітерацію; ручна перевірка через `curl` (2026-11-25) показала, що API їх не валідує: `POST /booking` повертає `200 OK` для `totalprice: -100`, для `checkout` раніше за `checkin`, для імені з 5000 символів, а для `totalprice: "abc"` — `200` і `totalprice: null` у відповіді. Перевірено по [apidoc](https://restful-booker.herokuapp.com/apidoc): для `CreateBooking` там вказано лише типи (`totalprice` — Number, дати — Date, імена — String), жодних діапазонів, максимальної довжини чи правила «checkout після checkin», і не описано відповіді з помилками. Тому це **можливі баги**, а не підтверджені: від'ємна ціна, зворотний порядок дат і довге імʼя не порушують задокументованих правил. Єдиний випадок, що суперечить документації, — `totalprice: "abc"` (тип Number, а API повертає 200 і `null`); його оформлено як BUG-API-04 нижче.

## Знайдені баги

### BUG-UI-01 — Можна оформити замовлення з порожнім кошиком
**Серйозність:** Major · **Середовище:** saucedemo.com, standard_user, Chromium · **Тест:** `negative.spec.ts`

**Кроки:**
1. Залогінитись як `standard_user` / `secret_sauce`.
2. Не додаючи товарів, відкрити кошик.
3. Натиснути «Checkout», заповнити First Name, Last Name, Zip, натиснути «Continue».
4. Натиснути «Finish».

**Очікуваний результат:** кнопка «Checkout» неактивна або показується помилка «кошик порожній»; оформити замовлення неможливо.
**Фактичний результат:** користувач проходить на сторінку Overview з Item total $0.00 і завершує «замовлення» з повідомленням «Thank you for your order!».

---

### BUG-API-01 — `POST /auth` з невірними обліковими даними повертає 200 OK
**Серйозність:** Minor · **Тест:** `booking-negative.spec.ts`

**Кроки:**
```http
POST /auth
Content-Type: application/json

{"username": "admin", "password": "wrong_password"}
```
**Очікуваний результат:** `401 Unauthorized`.
**Фактичний результат:** `200 OK` з тілом `{"reason": "Bad credentials"}`. Клієнти, які перевіряють лише статус-код, вважатимуть авторизацію успішною.

---

### BUG-API-02 — `DELETE /booking/{id}` повертає 201 Created
**Серйозність:** Trivial · **Тест:** `booking-negative.spec.ts` (`test.fail`)

**Кроки:** отримати токен, створити бронювання, виконати `DELETE /booking/{id}` з `Cookie: token=<token>`.
**Очікуваний результат:** `200 OK` або `204 No Content`.
**Фактичний результат:** `201 Created`. Поведінка збігається з офіційною документацією, але семантично `201` означає створення ресурсу — це вводить в оману клієнтів API. CRUD-флоу перевіряє лише `res.ok()`, щоб не закріплювати некоректний код.

---

### BUG-API-03 — Створення бронювання без обовʼязкових полів повертає 500
**Серйозність:** Major · **Тест:** `booking-negative.spec.ts`

**Кроки:**
```http
POST /booking
Content-Type: application/json
Accept: application/json

{"totalprice": 150, "depositpaid": true,
 "bookingdates": {"checkin": "2026-12-01", "checkout": "2026-12-05"}}
```
**Очікуваний результат:** `400 Bad Request` з описом, яких полів бракує.
**Фактичний результат:** `500 Internal Server Error`. Помилка валідації вхідних даних обробляється як збій сервера.

---

### BUG-API-04 — `POST /booking` приймає нечислову `totalprice` і зберігає `null`
**Серйозність:** Minor · **Тест:** `booking-negative.spec.ts` (`test.fail`)

**Кроки:**
```http
POST /booking
Content-Type: application/json
Accept: application/json

{"firstname": "A", "lastname": "B", "totalprice": "abc", "depositpaid": true,
 "bookingdates": {"checkin": "2027-01-10", "checkout": "2027-01-15"}}
```
**Очікуваний результат:** `400 Bad Request`: за [apidoc](https://restful-booker.herokuapp.com/apidoc) `totalprice` має тип Number.
**Фактичний результат:** `200 OK`, у відповіді `"totalprice": null` — бронювання створено зі зламаними даними (перевірено через `curl` 2026-11-25). Код відповіді в документації для цього випадку не вказано, тому очікуваний `400` — розумне припущення, а не цитата специфікації.

## Бонус: конвеєр «тест-кейс → Playwright-тест»

Скрипт на Node без залежностей, модель — агент Claude Code у headless-режимі (`claude -p`).

```bash
claude login                                   # один раз
npm run generate -- testcases/TC-UI-001-add-all-products.md
```

Що робить [`scripts/generate-test.mjs`](./scripts/generate-test.mjs):
1. Збирає промпт: інструкція зі скіла [`testcase-to-playwright`](./.claude/skills/testcase-to-playwright/SKILL.md) + текст кейсу (`testcases/TC-UI-NNN-*.md`, формат — `testcases/TEMPLATE.md`).
2. Запускає `claude -p` з обмеженим набором інструментів (читання, запис, `npx playwright test`, `npm run`). Агент читає Page Object, пише `tests/ui/generated/TC-UI-NNN.spec.ts` і сам ганяє тест.
3. **Незалежно від агента** перевіряє результат: `check:testcases` (кожен кейс має тест з тегом `[TC-ID]`, у тестах немає `waitForTimeout`, `nth()`, `page.locator`, `describe.serial`, XPath), `typecheck`, запуск згенерованого тесту. Падіння на будь-якому кроці — код виходу ≠ 0, скрипт нічого не підправляє за агента.

Генерація запускається локально (потрібен вхід в акаунт Claude). У CI йде лише `check:testcases`.

### Приклади (реальні прогони)

| Вхід | Що згенерувалось | Пройшов? | Що довелось правити руками |
|---|---|---|---|
| [TC-UI-001](./testcases/TC-UI-001-add-all-products.md): додати всі товари в кошик | [`TC-UI-001.spec.ts`](./tests/ui/generated/TC-UI-001.spec.ts) + метод `addAllToCart()` у `InventoryPage` | Так, з першого запуску скрипта | Нічого в тесті. Агент сам знайшов, що `InventoryPage.slug()` (мій код) ламається на товарі «Test.allTheThings() T-Shirt (Red)»: у реальному `data-test` лишаються крапка й дужки. Я підтвердив це на живій сторінці й виправив `slug()` (див. AI_WORKLOG) |
| [TC-UI-002](./testcases/TC-UI-002-cancel-checkout.md): Cancel у чекауті повертає в кошик | [`TC-UI-002.spec.ts`](./tests/ui/generated/TC-UI-002.spec.ts) + `cancelButton` у `CheckoutPage` | Так | Один рядок у Page Object: агент написав `this.error =page...` без пробілу (форматування) — виправив вручну |
| [TC-UI-003](./testcases/TC-UI-003-back-home-after-order.md): «Back Home» після замовлення | [`TC-UI-003.spec.ts`](./tests/ui/generated/TC-UI-003.spec.ts) + `backHomeButton` у `CheckoutPage` | Так | Нічого |

**Обмеження.** Проходження тесту не доводить, що він перевіряє саме те, що в кейсі: це ревʼю робить людина (я переглянув усі три тести). Селектори, яких агент не бачив у наявних Page Object, він підбирає сам (`cancel`, `back-to-products`) і підтверджує лише тим, що тест пройшов.
