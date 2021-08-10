import '../lib/shim.js';
import { Ocean } from '../lib/mod.js';
import { customElements, document, HTMLElement, consume, parse } from './helpers.js';
import { assert, assertEquals } from './deps.js';

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

Deno.test('Polyfill is included when there is an html element but no head', async () => {
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
  customElements.define('my-basic-element-no-head', MyElement);
  let iter = html`
    <!doctype html>
    <html lang="en">
    <title>My app</title>
    <div id="testing">Testing</div>
    <my-basic-element-no-head></my-basic-element-no-head>
  `;
  let out = await consume(iter);
  let doc = parse(out);
  let script = doc.querySelector('script');
  assert(script, 'Polyfill script included.');
  assertEquals(script.nextElementSibling.id, 'testing');
});

Deno.test('No polyfill added if no polyfillURL is provided', async () => {
  const { html } = new Ocean({
    document
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
  customElements.define('my-basic-element-no-polyfillurl', MyElement);
  let iter = html`
    <!doctype html>
    <html lang="en">
    <title>My app</title>
    <div id="testing">Testing</div>
    <my-basic-element-no-polyfillurl></my-basic-element-no-polyfillurl>
  `;
  let out = await consume(iter);
  let doc = parse(out);
  let script = doc.querySelector('script');
  assert(!script, 'Polyfill script not included.');
});

Deno.test('No polyfill added if there is no head or html', async () => {
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
  customElements.define('my-basic-element-no-head-or-html', MyElement);
  let iter = html`
    <div id="testing">Testing</div>
    <my-basic-element-no-head-or-html></my-basic-element-no-head-or-html>
  `;
  let out = await consume(iter);
  let doc = parse(out);
  let script = doc.querySelector('script');
  assert(!script, 'Polyfill script not included.');
});

Deno.test('No polyfill is added if there are no SSR components', async () => {
  const { html } = new Ocean({
    document,
    polyfillURL: '/webcomponents/declarative-shadow-dom.js'
  });

  let iter = html`
    <html lang="en">
    <div id="testing">Testing</div>
  `;
  let out = await consume(iter);
  let doc = parse(out);
  let script = doc.querySelector('script');
  assert(!script, 'Polyfill script not included.');
});