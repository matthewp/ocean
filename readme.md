# Ocean

Web component HTML rendering that includes:

* Rendering with [Declarative Shadow DOM](https://web.dev/declarative-shadow-dom/), requiring no JavaScript in the client.
* Automatic inclusion of the Declarative Shadow DOM polyfill for browsers without support.
* Streaming HTML responses.
* Compatibility with the most popular web component libraries (see a compatibility list below).
* Lazy [partial hydration](https://www.jameshill.dev/articles/partial-hydration/) via special attributes: hydrate on page load, CPU idle, element visibility, or media queries. Or create your own hydrator.

## Overview

An *ocean* is an environment for rendering web component code. It provides an `html` function that looks like the ones you're used to from libraries like [uhtml](https://github.com/WebReflection/uhtml) and [Lit](https://lit.dev/). Instead of creating reactive DOM in the client like those libraries, Ocean's `html` returns an *async iterator* that will stream out HTML strings.

Ocean is somewhat low-level and is meant to be used with a higher-level framework. Typical usage looks like this:

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

## Modules

Ocean comes with its main module and a DOM shim for compatible with custom element code.

### Main module

The main module for Ocean is available in two forms: bundled and unbundled.

* If you are using Ocean in a browser context, such as a service worker, use the bundled version.
* If you are using Ocean in [Deno](https://deno.land/), use the unbundled version.

#### Unbundled

```js
import { Ocean } from 'https://cdn.spooky.click/ocean/0.2.1/mod.js';
```

#### Bundled

```js
import { Ocean } from 'https://cdn.spooky.click/ocean/0.2.1/mod.bundle.js';
```

### DOM shim

Ocean's DOM shim is backed by [linkedom](https://github.com/WebReflection/linkedom), a fast DOM layer. The shim also bridges compatibility with popular web component libraries.

It's important to import the DOM shim as one of the first imports in your app.

```js
import 'https://cdn.spooky.click/ocean/0.2.1/shim.js?global';
```

Notice that this includes in the `?global` query parameter. This makes the shim available on globals; you get `document`, `customElements`, and other commonly used global variables.

If you do not want to shim the global environment you can omit the `?global` query parameter and instead get the globals yourself from the symbol `Symbol.for('dom-shim.defaultView')`. This is advanced usage.

```js
import 'https://cdn.spooky.click/ocean/0.2.1/shim.js';

const root = globalThis[Symbol.for('dom-shim.defaultView')];
const { HTMLElement, customElements, document } = root;
```

## Compatibility

Ocean is tested against popular web component libraries. These tests are not all inclusive, test contributions are very much welcome.

| Library    | Compatible | Notes                            |
|------------|------------|----------------------------------|
| Lit        | ✓          |                                  |
| Preact     | ✓          |                                  |
| petite-vue | ✓          |                                  |
| Haunted    | ✓          |                                  |
| Fast       | ✖          | Heavily relies on DOM internals. |