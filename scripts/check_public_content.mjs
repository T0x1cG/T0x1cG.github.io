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
const writeupIds = new Set();
for (const item of archive.writeups) {
  assert.ok(!writeupIds.has(item.id), `Duplicate writeup ID: ${item.id}`);
  writeupIds.add(item.id);
  assert.ok(['digital-dragons-2026', 'cyber-arena-2026'].includes(item.competition), `Missing competition: ${item.id}`);
  assert.ok(item.document && !item.pdf, `Writeups must display text directly: ${item.id}`);
  const path = item.document;
  assert.match(path, /^assets\/writeups\/[a-z0-9/_-]+\.md$/i);
  assert.ok(!path.includes('..'), `Path traversal: ${item.id}`);
  assert.ok(existsSync(path), `Missing writeup file: ${path}`);
  const markdown = readFileSync(path, 'utf8');
  assert.ok(markdown.startsWith(`# ${item.title}\n`), `Missing title: ${item.id}`);
  let inCode = false;
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('```')) continue;
    assert.match(line, inCode ? /^```$/ : /^```[a-z0-9_+-]*$/i, `Malformed code fence: ${item.id}`);
    inCode = !inCode;
  }
  assert.equal(inCode, false, `Unclosed code block: ${item.id}`);
  for (const [, target] of markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const image = new URL(target, new URL(`../${path}`, import.meta.url));
    assert.equal(image.protocol, 'file:', `Remote writeup image: ${item.id}`);
    assert.ok(existsSync(image), `Missing writeup image: ${target}`);
  }
}
console.log('Writeup files and competition metadata checks passed.');
