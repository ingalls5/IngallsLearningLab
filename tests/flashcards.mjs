import { mkdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

mkdirSync('.sites-runtime', { recursive: true });
for (const file of ['test-flashcards.mjs', 'compile-reading-tests.mjs']) {
  copyFileSync(new URL('./fixtures/' + file, import.meta.url), '.sites-runtime/' + file);
}
const result = spawnSync(process.execPath, ['.sites-runtime/test-flashcards.mjs'], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
