import '../lib/shim.js';
import { assertEquals, assertStringIncludes } from './deps.js';
import { Ocean } from '../lib/mod.js';
import { consume, HTMLElement, customElements, document, parse } from './helpers.js';

Deno.test('relativeTo makes the polyfillURL relative', async () => {
  let { relativeTo } = new Ocean({
    document,
    polyfillURL: '/js/polyfill.js'
  });
  customElements.define('my-rel-el', class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let el = document.createElement('div');
      el.textContent = `works`;
      this.shadowRoot.append(el);
    }
  });

  let url = new URL('http://example.com/some/deep/path');
  let html = relativeTo(url);
  let iter = html`
    <html lang="en">
    <title>Some app</title>
    <my-rel-el></my-rel-el>
  `;
  let out = await consume(iter);
  assertStringIncludes(out, `import("../../js/polyfill.js")`);
});

Deno.test('relativeTo makes element URLs relative', async () => {
  let { elements, relativeTo } = new Ocean({ document });
  customElements.define('my-rel-el-two', class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let el = document.createElement('div');
      el.textContent = `works`;
      this.shadowRoot.append(el);
    }
  });
  elements.set('my-rel-el-two', '/js/components/my-rel-el-two.js');

  let url = new URL('http://example.com/some/deep/path');
  let html = relativeTo(url);
  let iter = html`
    <html lang="en">
    <title>Some app</title>
    <my-rel-el-two ocean-hydrate="load"></my-rel-el-two>
    <my-rel-el-two ocean-hydrate="idle"></my-rel-el-two>
  `;
  let out = await consume(iter);
  let dom = parse(out);
  const expected = '../../js/components/my-rel-el-two.js';
  assertEquals(dom.querySelector('script[src]').getAttribute('src'), expected);
  assertEquals(dom.querySelector('ocean-hydrate-idle').getAttribute('src'), expected);
});

Deno.test('relativeTo can be passed a string URL', async () => {
  let { relativeTo } = new Ocean({
    document,
    polyfillURL: '/js/polyfill.js'
  });
  customElements.define('my-rel-el-three', class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let el = document.createElement('div');
      el.textContent = `works`;
      this.shadowRoot.append(el);
    }
  });

  let html = relativeTo('http://example.com/some/deep/path');
  let iter = html`
    <html lang="en">
    <title>Some app</title>
    <my-rel-el-three></my-rel-el-three>
  `;
  let out = await consume(iter);
  assertStringIncludes(out, `import("../../js/polyfill.js")`);
});