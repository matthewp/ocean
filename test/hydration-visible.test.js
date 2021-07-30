import '../lib/shim.js';
import { Ocean } from '../lib/mod.js';
import { customElements, document, consume, HTMLElement, parse } from './helpers.js';
import { assert } from './deps.js';

Deno.test('Adds an inline script to load on visibility', async () => {
  let { html, elements } = new Ocean({
    document
  });

  elements.set('my-visible-element', '/elements/my-visible-element.js');

  customElements.define('my-visible-element', class extends HTMLElement {
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
    <my-visible-element ocean-hydrate="visible"></my-visible-element>
  `;
  let out = await consume(iter);
  let doc = parse(out);
  assert(doc.querySelector('script'));
  assert(doc.querySelector('ocean-hydrate-visible[src="/elements/my-visible-element.js"]'));
});