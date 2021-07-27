import '../lib/shim.js';
import { Ocean } from '../lib/mod.js';
import { customElements, document, HTMLElement, consume, parse } from './helpers.js';
import { assert } from './deps.js';

Deno.test('Polyfill is included when there is a head element', async () => {
  const { html } = new Ocean({
    document,
    polyfillURL: '/webcomponents/declarative-shadow-dom.js'
  });

  class MyElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let div = document.createElement('div');
      div.textContent = 'works';
      this.shadowRoot.append(div);
    }
  }
  customElements.define('my-basic-element-with-head', MyElement);
  let iter = html`
    <!doctype html>
    <html lang="en">
    <head>
      <title>My app</title>
    </head>
    <body>
      <div>Testing</div>
      <my-basic-element-with-head></my-basic-element-with-head>
    </body>
  `;
  let out = await consume(iter);
  let doc = parse(out);
  assert(doc.querySelector('script'), 'Polyfill script included.');
});