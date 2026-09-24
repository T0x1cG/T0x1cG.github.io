import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { hasPublishedFlag } from './flag-policy.mjs';

const nodes = new Map();
const managed = { innerHTML: '' };
let scrolled = 0;
const heading = { scrollIntoView: () => { scrolled += 1; } };
nodes.set('1-recon', heading);
nodes.set('outside-reader', { scrollIntoView: () => { throw new Error('Outside reader'); } });
const context = vm.createContext({
  URL,
  location: new URL('https://portfolio.example/'),
  document: {
    baseURI: 'https://portfolio.example/',
    documentElement: { dataset: { frameState: 'pending' } },
    getElementById: id => nodes.get(id) || null,
    querySelector: selector => {
      if (selector === '#manageList') return managed;
      if (selector === '#writeupDocument') return { contains: node => node === heading };
      throw new Error(`Unexpected selector: ${selector}`);
    }
  }
});
vm.runInContext(readFileSync(new URL('../app.js', import.meta.url), 'utf8'), context);
const run = code => vm.runInContext(code, context);
const inline = value => run(`formatInline(${JSON.stringify(value)}, 'assets/writeups/example.md')`);

const payload = '![x\uE0001\uE001](missing.png) [y](https://x.com/onerror=location=name//)';
assert.equal(inline(payload), '<img src="https://portfolio.example/assets/writeups/missing.png" alt="x1" loading="lazy" /> <a href="https://x.com/onerror=location=name//" target="_blank" rel="noreferrer">y</a>');
for (const marker of ['\uE0000\uE001', '\uE0001\uE001', '\uE000999\uE001']) {
  assert.ok(!inline(`![${marker}](test.png) [${marker}](https://example.com)`).includes('\uE000'));
}
assert.equal(inline('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
assert.equal(inline('`<tag>` **bold**'), '<code>&lt;tag&gt;</code> <strong>bold</strong>');
assert.equal(inline('[blocked](javascript:evil)'), 'blocked');
assert.match(inline('![" onerror="evil](image.png)'), /alt="&quot; onerror=&quot;evil"/);
assert.equal(run(`markdownToHtml('# 1. Recon', '').headings[0].id`), '1-recon');
run(`scrollWriteupHeading('1-recon'); scrollWriteupHeading('missing'); scrollWriteupHeading('outside-reader');`);
assert.equal(scrolled, 1);

run(`adminStatus.authenticated = true; archive = { 'writeups" onclick="evil': [{ id: 'x" autofocus onfocus="evil', title: '<title>' }] }; renderManageList();`);
assert.ok(managed.innerHTML.includes('data-delete-type="writeups&quot; onclick=&quot;evil"'));
assert.ok(managed.innerHTML.includes('data-delete-id="x&quot; autofocus onfocus=&quot;evil"'));
assert.equal(run(`contentEntryPath('writeups/a', 'a/b?x=1#fragment')`), '/api/content/writeups%2Fa/a%2Fb%3Fx%3D1%23fragment');

assert.equal(hasPublishedFlag('flag{test-secret}'), true);
assert.equal(hasPublishedFlag('HTB{test-secret}'), true);
assert.equal(hasPublishedFlag('flag{REDACTED} and flag{<uuid4>}'), true);
assert.equal(hasPublishedFlag('The known prefix is flag{.'), true);
assert.equal(hasPublishedFlag('[recovered challenge answer omitted]'), false);
console.log('Browser security and flag-policy regression tests passed.');
