import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const archive = JSON.parse(readFileSync(new URL('../data/content.json', import.meta.url)));
assert.equal(Object.hasOwn(archive, 'notes'), false, 'Study-note metadata must not be published');
const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
assert.equal(tracked.some(path => path.startsWith('assets/notes/') && existsSync(path)), false, 'Study-note files must not be published');
for (const item of Object.values(archive).flat()) {
  if (!item.url) continue;
  const url = new URL(item.url);
  assert.ok(['https:', 'http:', 'mailto:'].includes(url.protocol), `Unsafe link scheme: ${item.id}`);
  assert.ok(!url.username && !url.password, `Embedded credentials: ${item.id}`);
}
console.log('Public content checks passed.');
