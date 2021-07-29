import '../lib/shim.js';
import { Ocean } from '../lib/mod.js';
import { customElements, document, consume, HTMLElement, parse } from './helpers.js';
import { assert } from './deps.js';

Deno.test('Adds the element script to the page', async () => {
  let { html, elements } = new Ocean({
    document
  });

  elements.set('my-load-element', '/elements/my-load-element.js');

  customElements.define('my-load-element', class extends HTMLElement {
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
    <my-load-element ocean-hydrate="load"></my-load-element>
  `;
  let out = await consume(iter);
  let doc = parse(out);
  assert(doc.querySelector('script[src="/elements/my-load-element.js"]'));
});