import '../../lib/shim.js';
import { stamp } from 'https://cdn.skypack.dev/grim2@1.3.1';
import { Ocean } from '../../lib/mod.js';
import { consume, HTMLElement, customElements, document } from '../helpers.js';
import { assertStringIncludes } from '../deps.js';

Deno.test('Works with Grim elements', async () => {
  let { html } = new Ocean({ document });
  let raw = document.createElement('template');
  raw.innerHTML = `
    <div>Hello {{name}}</div>
  `;
  let template = stamp(raw);
  class MyElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let frag = template.createInstance({ name: 'World' });
      this.shadowRoot.appendChild(frag);
    }
  }

  customElements.define('my-grim-element', MyElement);

  let iter = html`<my-grim-element></my-grim-element>`;
  let out = await consume(iter);
  assertStringIncludes(out, '<div>Hello World</div>');
});