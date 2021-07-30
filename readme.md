# Ocean

Custom element rendering tools.

## Usage

```js
import 'https://cdn.spooky.click/ocean/0.2.1/shim.js?global';
import { Ocean } from 'https://cdn.spooky.click/ocean/0.2.1/mod.js';

const { HTMLElement, customElements, document } = globalThis;

class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    let div = document.createElement('div');
    div.textContent = `This is an app!`;
    this.shadowRoot.append(div);
  }
}

customElements.define('app-root', AppRoot);

const { html } = new Ocean({
  document,
  polyfillURL: '/webcomponents/declarative-shadow-dom.js'
});

let iterator = html`
  <!doctype html>
  <html lang="en">
  <title>My app</title>

  <app-root></app-root>
`;

for await(let chunk of iterator) {
  console.log(chunk); // HTML string
}
```