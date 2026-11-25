---
name: testcase-to-playwright
description: Перетворює текстовий тест-кейс з testcases/*.md на Playwright-тест у цьому репозиторії. Використовуй, коли просять "згенеруй тест з TC-..." або з'являється новий файл у testcases/.
---

# testcase-to-playwright

Вхід: файл `testcases/TC-<AREA>-<NNN>-*.md` (формат — `testcases/TEMPLATE.md`).
Вихід: `tests/ui/generated/TC-UI-NNN.spec.ts`, що проходить `npm run check:testcases` і `npx playwright test`.

## Алгоритм
1. Прочитай тест-кейс і `CLAUDE.md` (правила локаторів, заборона sleep/serial, не хардкодити дані зі сторінки).
2. Прочитай `tests/ui/fixtures.ts`, Page Object-и в `tests/ui/pages/` і enum-и локаторів у `tests/ui/locators/` (новий `data-test` додавай у відповідний enum). Використовуй наявні методи; якщо методу бракує — додай його в Page Object, а не пиши сирий локатор у тесті.
3. Передумову "залогінений standard_user" реалізуй фікстурою `loggedIn`.
4. Назва тесту: `[TC-UI-NNN] <title з кейсу>` — тег потрібен для простежуваності, його перевіряє `scripts/check-testcases.mjs`.
5. Кожен пункт "Очікуваний результат" — окремий web-first assert. Кроки, що залежать одне від одного, — `test.step`.
6. Не вигадуй селектори: якщо не бачив DOM або Page Object, перевір запуском; невідомий елемент — скажи про це.
7. Запусти `npm run check:testcases`, `npm run typecheck`, `npx playwright test --project=ui <файл>`. Падіння не маскуй: якщо це баг продукту — `test.fail(true, 'BUG-XXX: ...')` + баг-репорт у README.

## Чого не робити
- Не редагуй сам тест-кейс під те, що вийшло в тесті.
- Не додавай бібліотеки та LLM-залежності в репозиторій.
