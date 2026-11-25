// Перевірка конвеєра "тест-кейс -> тест" без залежностей (чистий Node).
//  1) кожен testcases/TC-*.md має тест з тегом [TC-ID] у назві;
//  2) кожен тег [TC-ID] у тестах посилається на існуючий кейс;
//  3) у тестах немає заборонених патернів із CLAUDE.md.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const errors = [];

const cases = new Map();
for (const file of readdirSync('testcases').filter((f) => /^TC-.*\.md$/.test(f))) {
  const text = readFileSync(join('testcases', file), 'utf8');
  const id = text.match(/^id:\s*(TC-[A-Z]+-\d+)\s*$/m)?.[1];
  if (!id) errors.push(`${file}: немає поля id у frontmatter`);
  else if (!file.startsWith(id)) errors.push(`${file}: імʼя файлу має починатися з ${id}`);
  else cases.set(id, file);
}

const specs = walk('tests').filter((f) => f.endsWith('.spec.ts'));
const tagged = new Set();
const forbidden = [
  [/waitForTimeout\s*\(/, 'waitForTimeout'],
  [/\.nth\s*\(/, 'nth()'],
  [/\bpage\.locator\s*\(/, 'page.locator (лише getByTestId/getByRole)'],
  [/describe\.serial/, 'describe.serial'],
  [/xpath=|\/\/\*\[/, 'XPath'],
];
for (const file of specs) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\[(TC-[A-Z]+-\d+)\]/g)) {
    tagged.add(m[1]);
    if (!cases.has(m[1])) errors.push(`${file}: тег ${m[1]} без файлу в testcases/`);
  }
  for (const [re, name] of forbidden) if (re.test(text)) errors.push(`${file}: заборонено ${name}`);
}
// CHECK_ONLY=TC-UI-001 — під час генерації одного кейсу не вимагати тестів для ще не згенерованих
for (const [id, file] of cases) if (!tagged.has(id) && (!process.env.CHECK_ONLY || process.env.CHECK_ONLY === id)) errors.push(`${file}: немає тесту з тегом [${id}]`);

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(
  process.env.CHECK_ONLY
    ? `✓ ${process.env.CHECK_ONLY}: тест є; заборонених патернів немає`
    : `✓ ${cases.size} тест-кейс(ів), усі мають тест; заборонених патернів немає`,
);
