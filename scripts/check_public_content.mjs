import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
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
const writeupIds = new Set();
for (const item of archive.writeups) {
  assert.ok(!writeupIds.has(item.id), `Duplicate writeup ID: ${item.id}`);
  writeupIds.add(item.id);
  assert.ok(['digital-dragons-2026', 'cyber-arena-2026'].includes(item.competition), `Missing competition: ${item.id}`);
  assert.ok(Boolean(item.pdf) !== Boolean(item.document), `Expected one document: ${item.id}`);
  const path = item.pdf || item.document;
  assert.match(path, /^assets\/writeups\/[a-z0-9/_-]+\.(md|pdf)$/i);
  assert.ok(!path.includes('..'), `Path traversal: ${item.id}`);
  assert.ok(existsSync(path), `Missing writeup file: ${path}`);
  if (item.pdf) {
    assert.ok(path.endsWith('.pdf'));
    assert.equal(readFileSync(path).subarray(0, 5).toString(), '%PDF-');
    assert.equal(statSync(path).size, item.fileSize, `PDF size mismatch: ${item.id}`);
    assert.ok(Number.isInteger(item.pages) && item.pages > 0);
  }
}
console.log('Writeup files and competition metadata checks passed.');
