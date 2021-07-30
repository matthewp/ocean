import '../lib/shim.js';
import { Ocean } from '../lib/mod.js';
import { customElements, document, consume, HTMLElement, parse } from './helpers.js';
import { assert, assertEquals } from './deps.js';

Deno.test('Adds an inline script to load on idle', async () => {
  let { html, elements } = new Ocean({
    document
  });

  elements.set('my-idle-element', '/elements/my-idle-element.js');

  customElements.define('my-idle-element', class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let div = document.createElement('div');
      div.id = 'root';
      this.shadowRoot.append(div);
    }
  });

  let iter = html`
    <!doctype html>
    <html lang="en">
    <title>My Site</title>
    <my-idle-element ocean-hydrate="idle"></my-idle-element>
  `;
  let out = await consume(iter);
  let doc = parse(out);
  assert(doc.querySelector('script'));
  assert(doc.querySelector('ocean-hydrate-idle[src="/elements/my-idle-element.js"]'));
});

Deno.test('Only adds the idle element once', async () => {
  let { html, elements } = new Ocean({
    document
  });

  elements.set('my-idle-element2', '/elements/my-idle-element.js');

  customElements.define('my-idle-element2', class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let div = document.createElement('div');
      div.id = 'root';
      this.shadowRoot.append(div);
    }
  });

  let iter = html`
    <!doctype html>
    <html lang="en">
    <title>My Site</title>
    <my-idle-element2 ocean-hydrate="idle"></my-idle-element2>
    <my-idle-element2 ocean-hydrate="idle"></my-idle-element2>
  `;
  let out = await consume(iter);
  let doc = parse(out);
  assertEquals(doc.querySelectorAll('script').length, 1);
  assertEquals(doc.querySelectorAll('ocean-hydrate-idle').length, 1);
});