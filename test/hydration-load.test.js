import '../lib/shim.js';
import { Ocean } from '../lib/mod.js';
import { customElements, document, consume, HTMLElement, parse } from './helpers.js';
import { assert, assertEquals } from './deps.js';

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

Deno.test({
  name: 'When using load, other conditions are ignored for that element',
  ignore: true,
  fn: async () => {
    const createGenericElementType = tagName => customElements.define(tagName, class extends HTMLElement {
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
    createGenericElementType('my-load-element-two');
    createGenericElementType('some-other-element-idle');
  
    let { html, elements } = new Ocean({
      document
    });
  
    elements.set('my-load-element-two', '/elements/my-load-element-two.js');
    elements.set('some-other-element-idle', '/elements/some-other-element-idle.js');
  
    let iter = html`
      <!doctype html>
      <html lang="en">
      <title>My site</title>
      <some-other-element-idle ocean-hydrate="idle"></some-other-element-idle>
      <my-load-element-two ocean-hydrate="idle"></my-load-element-two>
      <my-load-element-two ocean-hydrate="load"></my-load-element-two>
      <my-load-element-two ocean-hydrate="idle"></my-load-element-two>
    `;
    let out = await consume(iter);
    console.log(out);
    let doc = parse(out);
    assert(doc.querySelector('ocean-hydrate-idle[src="/elements/some-other-element-idle.js"]'), 'other element has its idle tag rendered');
    //assertEquals(doc.querySelectorAll('script').length, 2, 'Two scripts added');
    //assertEquals(doc.querySelector('ocean-hydrate-idle[src="/elements/my-load-element-two.js"]'), null);
  }
});