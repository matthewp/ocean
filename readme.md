# 🌊 Ocean

Web component HTML rendering that includes:

* Rendering to [Declarative Shadow DOM](https://web.dev/declarative-shadow-dom/), requiring no JavaScript in the client.
* Automatic inclusion of the Declarative Shadow DOM polyfill for browsers without support.
* Streaming HTML responses.
* Compatibility with the most popular web component libraries (see a compatibility list below).
* Lazy [partial hydration](https://www.jameshill.dev/articles/partial-hydration/) via special attributes: hydrate on page load, CPU idle, element visibility, or media queries. Or create your own hydrator.

---

__Table of Contents__

* __[Overview](#overview)__
* __[Modules](#modules)__
  * __[Main module](#main-module)__
  * __[DOM shim](#dom-shim)__
* __[Hydration](#hydration)__
  * __[Full hydration](#full-hydration)__
  * __[Partial hydration](#partial-hydration)__
* __[Plugins](#plugins)__
* __[Compatibility](#compatibility)__

## Overview

An *ocean* is an environment for rendering web component code. It provides an `html` function that looks like the ones you're used to from libraries like [uhtml](https://github.com/WebReflection/uhtml) and [Lit](https://lit.dev/). Instead of creating reactive DOM in the client like those libraries, Ocean's `html` returns an *async iterator* that will stream out HTML strings.

Ocean is somewhat low-level and is meant to be used with a higher-level framework. Typical usage looks like this:

```js
import 'https://cdn.spooky.click/ocean/1.2.3/shim.js?global';
import { Ocean } from 'https://cdn.spooky.click/ocean/1.2.3/mod.js';

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

let code = '';
for await(let chunk of iterator) {
  code += chunk;
}
console.log(chunk); // HTML string
```

The above will generate the following HTML:

```html
<!doctype html>
<html lang="en">
<title>My app</title>

<script type="module">const o=(new DOMParser).parseFromString('<p><template shadowroot="open"></template></p>',"text/html",{includeShadowRoots:!0}).querySelector("p");o&&o.shadowRoot||async function(){const{hydrateShadowRoots:o}=await import("/webcomponents/declarative-shadow-dom.js");o(document.body)}()</script>
<app-root>
  <template shadowroot="open">
    <div>This is an app!</div>
  </template>
</app-root>
```

## Modules

Ocean comes with its main module and a DOM shim for compatible with custom element code.

### Main module

The main module for Ocean is available in two forms: bundled and unbundled.

* If you are using Ocean in a browser context, such as a service worker, use the bundled version.
* If you are using Ocean in [Deno](https://deno.land/), use the unbundled version.

#### Unbundled

```js
import { Ocean } from 'https://cdn.spooky.click/ocean/1.2.3/mod.js';
```

#### Bundled

```js
import { Ocean } from 'https://cdn.spooky.click/ocean/1.2.3/mod.bundle.js';
```

### DOM shim

Ocean's DOM shim is backed by [linkedom](https://github.com/WebReflection/linkedom), a fast DOM layer. The shim also bridges compatibility with popular web component libraries.

It's important to import the DOM shim as one of the first imports in your app.

```js
import 'https://cdn.spooky.click/ocean/1.2.3/shim.js?global';
```

Notice that this includes in the `?global` query parameter. This makes the shim available on globals; you get `document`, `customElements`, and other commonly used global variables.

If you do not want to shim the global environment you can omit the `?global` query parameter and instead get the globals yourself from the symbol `Symbol.for('dom-shim.defaultView')`. This is advanced usage.

```js
import 'https://cdn.spooky.click/ocean/1.2.3/shim.js';

const root = globalThis[Symbol.for('dom-shim.defaultView')];
const { HTMLElement, customElements, document } = root;
```

## Hydration

Partial hydration is the practice of only hydrating (via running client JavaScript) components that are needed for interactivity. Ocean *does not* automatically add scripts for components by default. However Ocean does support both full and partial hydration. This means you can omit the component script tags from your HTML and Ocean will automatically add them for you.

In order to add script tags you have to provide Ocean a map of tag names to URLs to load. You do this through the `elements` [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) that is returned from the constructor.

```js
let { html, elements } = new Ocean({
  document
});

elements.set('app-sidebar', '/elements/app-sidebar.js');
```

> *Note*: Ocean only adds script tags for elements that are *server rendered*. If you are not server rendering an element you will need to add the appropriate script tags yourself.

### Full hydration

Full hydration means added script tags to the `<head>` for any components that are server rendered. You can enable full hydration by passing this in the constructor:

```js
let { html, elements } = new Ocean({
  document,
  hydration: 'full'
});

elements.set('app-sidebar', '/elements/app-sidebar.js');

customElements.define('app-sidebar', class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    let div = document.createElement('div');
    div.textContent = `My sidebar...`;
    this.shadowRoot.append(div);
  }
});
```

Then when you render this element, it will include the script tags:

```js
let iterator = html`
  <!doctype html>
  <html lang="en">
  <title>My app</title>

  <app-sidebar></app-sidebar>
`;

let out = '';
for(let chunk of iterator) {
  out += chunk;
}
```

Will produce this HTML:

```html
<!doctype html>
<html lang="en">
<title>My app</title>
<script type="module" src="/elements/app-sidebar.js"></script>

<app-sidebar>
  <template shadowroot="open">
    <div>My sidebar...</div>
  </template>
</app-sidebar>
```

### Partial hydration

By default Ocean uses partial hydration. In partial hydration script tags are only added when you explicitly tell Ocean to hydration an element. This means that by default elements will be rendered to HTML only, and never iteractive on the client.

This allows you to use the web component libraries you love both to produce static HTML and for interactive content.

To declare an element to be hydrated, use the `ocean-hydrate` attribute on any element. The value should be one of:

* __load__: Hydrate when the page loads. Ocean will add a `<script type="module">` tag for the element's script.
* __idle__: Hydrate when the CPU becomes idle. Ocean will add an inline script that waits for `requestIdleCallback` and then loads the element's script.
* __media__: Hydrates on a matching media query. This allows you to have some elements which only hydrate for certain screen sizes. Use the `ocean-query` attribute to specify the media query.
* __visible__: Hydrate when the element becomes visible. This is useful for elements which are shown further down the page. Ocean will add an inline script that uses [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to determine when the element is visible and then loads the script.

Using one of these hydrators looks like:

```js
let iterator = html`
  <!doctype html>
  <html lang="en">
  <title>My site</title>

  <app-sidebar ocean-hydrate="idle"></app-sidebar>
`;
```

#### Hydrator options

You can specify which hydrators you want to use by providing the `hydrators` option to Ocean. Each of the default hydrators are included by default, but can also be imported.

```js
import {
  HydrateIdle,
  HydrateLoad,
  HydrateMedia,
  HydrateVisible,
  Ocean
} from 'https://cdn.spooky.click/ocean/1.2.3/mod.js';
```

##### Load

To specify to hydrate on load, pass `load` into the `ocean-hydrate` attr:

```js
let { html } = new Ocean({ document });

let iterator = html`
  <!doctype html>
  <html lang="en">
  <title>My site</title>

  <app-sidebar ocean-hydrate="load"></app-sidebar>
`;
```

__HydrateLoad__ does not take any options because it only adds a script tag to the head. You can create an instance by calling `new` on it:

```js
import { HydrateLoad, Ocean } from 'https://cdn.spooky.click/ocean/1.2.3/mod.js';

let { html } = new Ocean({
  document,
  hydrators: [
    new HydrateLoad()
  ]
});
```

##### Idle

To specify to hydrate on idle, pass `idle` into the `ocean-hydrate` attr:

```js
let { html } = new Ocean({ document });

let iterator = html`
  <!doctype html>
  <html lang="en">
  <title>My site</title>

  <app-sidebar ocean-hydrate="idle"></app-sidebar>
`;
```

__HydrateIdle__ uses a custom element to perform hydration when the CPU is idle. By default that custom element name is `ocean-hydrate-idle`. You can specify a different custom element name by passing it into the constructor.

```js
import { HydrateIdle, Ocean } from 'https://cdn.spooky.click/ocean/1.2.3/mod.js';

let { html } = new Ocean({
  document,
  hydrators: [
    new HydrateIdle('my-app-hydrate-idle')
  ]
});
```

##### Media

To hydrate on a media query, pass `media` into the `ocean-hydrate` attr, and also provide a `ocean-query` attr with the media query to use:

```js
let { html } = new Ocean({ document });

let iterator = html`
  <!doctype html>
  <html lang="en">
  <title>My site</title>

  <app-sidebar ocean-hydrate="media" ocean-query="(max-width: 700px)"></app-sidebar>
`
```

__HydrateMedia__ uses the custom element `ocean-hydrate-media` to hydrate your custom element. You can customize this, and also the attribute used for the query by passing those arguments into the constructor:

```js
import { HydrateMedia, Ocean } from 'https://cdn.spooky.click/ocean/1.2.3/mod.js';

let { html } = new Ocean({
  document,
  hydrators: [
    new HydrateMedia('my-app-hydrate-media', 'app-query')
  ]
});

let iterator = html`
  <!doctype html>
  <html lang="en">
  <title>My site</title>

  <app-sidebar ocean-hydrate="media" app-query="(max-width: 700px)"></app-sidebar>
`;
```

##### Visible

To specify to hydrate on element visibility, pass `visible` into the `ocean-hydrate` attr:

```js
let { html } = new Ocean({ document });

let iterator = html`
  <!doctype html>
  <html lang="en">
  <title>My site</title>

  <app-sidebar ocean-hydrate="visible"></app-sidebar>
`;
```

__HydrateVisible__ uses the custom element `ocean-hydrate-visible` to track when your element is visible. You can customize this custom element tag name by passing in something else into the constructor:

```js
import { HydrateVisible, Ocean } from 'https://cdn.spooky.click/ocean/1.2.3/mod.js';

let { html } = new Ocean({
  document,
  hydrators: [
    new HydrateVisible('my-app-hydrate-visible')
  ]
});
```

#### Custom hydrator

A hydrator is an object that specifies how to hydrate the element. You can create a custom hydrator and pass it to the `hydrators` option.

The following is a hydrator that hydrates whenever the element is clicked.

```js
const clickHydrator = {
  condition: 'click',
  tagName: 'my-click-hydrator',
  renderMultiple: true,
  script() {
    return /* js */ `customElements.define('${this.tagName}', class extends HTMLElement {
  connectedCallback() {
    let el = this.previousElementSibling;
    let src = this.getAttribute('src');
    el.addEventListener('click', () => import(src), { once: true });
  }
})`;
  }
};

let { html } = new Ocean({
  document,
  hydrators: [
    clickHydrator
  ]
})
```

Which you would use like so:

```js
let iterator = html`
  <!doctype html>
  <html lang="en">
  <title>My site</title>

  <app-sidebar ocean-hydrate="click"></app-sidebar>
`;
```

The properties of a hydrator are (all required):

* __condition__: This is the value used with `ocean-hydrate` to trigger the hydrator to be used.
* __tagName__: Hydrators are implemented as custom elements. The `tagName` is the custom element tag name.
* __renderMultiple__: This says that the custom element should be rendered for each element that uses the hydrator. Use `false` when hydrating is done without regard for the element. For example *idle* is `false` because it always just waits for CPU idle, so this only needs to be done once.
* __script()__: A function which returns the custom element definition.

The following are optional properties:

* __mutate(customElement, node)__: Gives you a change to modify the hydration custom element being rendered, for example to add information needed to perform hydration. __HydrateMedia__ uses this method to add the query to the custom element.

## Plugins

Ocean parses HTML into a DOM tree. Using plugins you can mutate the tree before it gets turned back into strings, allowing you to implement advanced behavior like syntax highlighting.

For the most part custom elements should be the way you customize HTML rendering; plugins are here for cases where you need to modify built-in elements.

The interface for a plugin is a function that returns an object with a `handle` method. The function is called during Ocean's internal optimization step:

```js
class MyHighlighter {
  handle(node, head) {
    // Mutate this node, add anything to the head that you need.
  }

  static createInstance() {
    return new MyHighlighter();
  }
}

let ocean = new Ocean({
  document,
  plugins: [MyHighlighter.createInstance]
});
```

## Compatibility

Ocean is tested against popular web component libraries. These tests are not all inclusive, test contributions are very much welcome.

| Library                                           | Compatible | Notes                                                                                                           |
|---------------------------------------------------|------------|-----------------------------------------------------------------------------------------------------------------|
| Vanilla                                           | ✔          |                                                                                                                 |
| [Lit](https://lit.dev/)                           | ✔          |                                                                                                                 |
| [Stencil](https://stenciljs.com/)                 | ✔          |                                                                                                                 |
| [Haunted](https://github.com/matthewp/haunted)    | ✔          |                                                                                                                 |
| [Atomico](https://atomicojs.github.io/)           | ✔          |                                                                                                                 |
| [uce](https://github.com/WebReflection/uce)       | ✔          |                                                                                                                 |
| [Preact](https://preactjs.com/)                   | ✔          |                                                                                                                 |
| [petite-vue](https://github.com/vuejs/petite-vue) | ✔          |                                                                                                                 |
| [Wafer](https://waferlib.netlify.app/)            | ✔          |                                                                                                                 |
| [FAST](https://www.fast.design/)                  | ✖          | Heavily relies on DOM internals.                                                                                |
| [Lightning Web Components](https://lwc.dev/)      | ✖          | I can't figure out how to export an LWC, if you can help see [#11](https://github.com/matthewp/ocean/issues/11) |