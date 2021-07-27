import '../../lib/shim.js?global';
import { createApp } from 'https://unpkg.com/petite-vue@0.2.3/dist/petite-vue.es.js';
import { Ocean } from '../../lib/mod.js';
import { consume, document, customElements } from '../helpers.js';
import { assertStringIncludes } from '../deps.js';

Deno.test('petite-vue elements render', async () => {
  let { html } = new Ocean({ document });
  function Component() {
    return {
      $template: `
        <div v-scope>
          <p>{{ count }}</p>
          <p>{{ plusOne }}</p>
          <button @click="increment">increment</button>
        </div>
      `,
      // exposed to all expressions
      count: 0,
      // getters
      get plusOne() {
        return this.count + 1
      },
      // methods
      increment() {
        this.count++
      }
    };
  }

  class MyElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this.shadowRoot.innerHTML = `<div v-scope="Component()"></div>`;
      createApp({
        Component
      }).mount(this.shadowRoot.firstElementChild);
    }
  }

  customElements.define('petite-vue-element', MyElement);

  let iter = html`<petite-vue-element></petite-vue-element>`;
  let out = await consume(iter);

  assertStringIncludes(out, '<p>0</p>');
  assertStringIncludes(out, '<p>1</p>');
});