// Конвеєр "текстовий тест-кейс -> Playwright-тест" через headless-агента (claude -p).
//
//   node scripts/generate-test.mjs testcases/TC-UI-003-*.md [--model <model>]
//
// 1) формує промпт: інструкція зі скіла + текст кейсу;
// 2) запускає `claude -p` (агент сам читає Page Object, пише тест і ганяє його);
// 3) НЕЗАЛЕЖНО перевіряє результат: check:testcases, typecheck, playwright test.
// Скрипт нічого не "виправляє" за агента: якщо перевірка впала, код виходу != 0.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const caseFile = args.find((a) => a.endsWith('.md'));
const modelIdx = args.indexOf('--model');
const model = modelIdx >= 0 ? args[modelIdx + 1] : undefined;
if (!caseFile || !existsSync(caseFile)) {
  console.error('Використання: node scripts/generate-test.mjs testcases/TC-UI-NNN-*.md [--model <model>]');
  process.exit(2);
}

const caseText = readFileSync(caseFile, 'utf8');
const id = caseText.match(/^id:\s*(TC-[A-Z]+-\d+)\s*$/m)?.[1];
if (!id) {
  console.error(`${caseFile}: немає id у frontmatter`);
  process.exit(2);
}
const outFile = `tests/ui/generated/${id}.spec.ts`;
const skill = readFileSync('.claude/skills/testcase-to-playwright/SKILL.md', 'utf8').replace(/^---[\s\S]*?---\s*/, '');

const prompt = `${skill}

---
Виконай алгоритм вище для цього тест-кейсу (файл ${caseFile}).
Результат запиши ТОЧНО у ${outFile}. Інші файли змінюй лише якщо бракує методу в Page Object.
Після запису запусти тест (npx playwright test --project=ui ${outFile}) і, якщо він падає, розберися в причині.
Перевірку простежуваності запускай як CHECK_ONLY=${id} npm run check:testcases (помилки про інші кейси без тестів ігноруй).
У кінці коротко (3-5 рядків) напиши: що згенеровано, чи пройшов тест, які файли, окрім ${outFile}, змінено.

ТЕСТ-КЕЙС:
${caseText}`;

const isWin = process.platform === 'win32';
const run = (cmd, cmdArgs, opts = {}) =>
  spawnSync(cmd, cmdArgs, { stdio: opts.input ? ['pipe', 'inherit', 'inherit'] : 'inherit', shell: isWin, encoding: 'utf8', ...opts });

console.log(`▶ Генерація ${id} через claude -p ...`);
const claudeArgs = [
  '-p',
  '--permission-mode', 'acceptEdits',
  '--allowedTools', 'Read', 'Write', 'Edit', 'Glob', 'Grep',
  '"Bash(npx playwright test:*)"', '"Bash(npm run:*)"',
  ...(model ? ['--model', model] : []),
];
// на Windows з shell:true аргументи з дужками треба брати в лапки; промпт іде через stdin
const gen = run(isWin ? 'claude.cmd' : 'claude', isWin ? claudeArgs : claudeArgs.map((a) => a.replace(/^"|"$/g, '')), { input: prompt });
if (gen.status !== 0) {
  console.error('✗ claude -p завершився з помилкою');
  process.exit(1);
}
if (!existsSync(outFile)) {
  console.error(`✗ агент не створив ${outFile}`);
  process.exit(1);
}

const steps = [
  ['перевірка простежуваності', 'npm', ['run', 'check:testcases']],
  ['typecheck', 'npm', ['run', 'typecheck']],
  ['запуск згенерованого тесту', 'npx', ['playwright', 'test', '--project=ui', outFile, '--reporter=list']],
];
for (const [name, cmd, cmdArgs] of steps) {
  console.log(`\n▶ ${name}`);
  if (run(cmd, cmdArgs, { env: { ...process.env, CHECK_ONLY: id } }).status !== 0) {
    console.error(`✗ ${name}: не пройдено — тест потребує ручного втручання`);
    process.exit(1);
  }
}
console.log(`\n✓ ${id}: згенеровано й пройдено (${outFile})`);
