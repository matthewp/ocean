import '../lib/shim.js';
import { assertEquals, assertStringIncludes, assertNotMatch } from './deps.js';
import { Ocean } from '../lib/mod.js';
import { consume, HTMLElement, customElements, document } from './helpers.js';

Deno.test('html handles comments', async () => {
  let { html } = new Ocean({ document });
  let iter = html`<div><!-- some comment --></div>`;
  let out = await consume(iter);
  assertEquals(out, `<div><!-- some comment --></div>`);
});

Deno.test('void elements render correctly', async () => {
  let { html } = new Ocean({ document });
  let iter = html`<meta name="author" content="Matthew Phillips">`;
  let out = await consume(iter);
  assertEquals(out, `<meta name="author" content="Matthew Phillips">`);

  iter = html`<img src="http://example.com/penguin.png" />`;
  out = await consume(iter);
  assertEquals(out, `<img src="http://example.com/penguin.png">`);
});

Deno.test('Can render async values in HTML', async () => {
  let { html } = new Ocean({ document });
  let iter = html`<div>One ${Promise.resolve(1)}<span>Two ${Promise.resolve(2)}</span></div>`;
  let out = await consume(iter);
  assertEquals(out, `<div>One 1<span>Two 2</span></div>`);
});

Deno.test('Can render async values in components', async () => {
  let { html } = new Ocean({ document });
  class MyElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let h1 = document.createElement('h1');
      h1.textContent = 'My App';
      this.shadowRoot.append(h1);
      this.shadowRoot.append(document.createElement('slot'));
    }
  }
  customElements.define('element-with-async-values', MyElement);
  let iter = html`<element-with-async-values><div id="inner">${Promise.resolve(2)}</div><div id="second">${33}</div></element-with-async-values>`;
  let out = await consume(iter);
  assertStringIncludes(out, '<h1>My App</h1>', 'shadow rendered');
  assertStringIncludes(out, '<div id="inner">2</div>', 'light rendered');
  assertStringIncludes(out, '<div id="second">33</div>', 'second light content');
});

Deno.test('Can provide attributes to custom elements', async () => {
  let { html } = new Ocean({ document });
  class MyElement extends HTMLElement {
    static observedAttributes = ['name']
    constructor() {
      super();
      this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
      let div = document.createElement('div');
      div.textContent = this.getAttribute('name');
      this.shadowRoot.append(div);
    }
  }
  customElements.define('element-with-attrs', MyElement);
  let iter = html`<element-with-attrs name="Matthew"></element-with-attrs>`;
  let out = await consume(iter);
  assertStringIncludes(out, `<div>Matthew</div>`);

  iter = html`<element-with-attrs name="${"Matthew"}"></element-with-attrs>`;
  out = await consume(iter);
  assertStringIncludes(out, `<div>Matthew</div>`);

  iter = html`<element-with-attrs name="${Promise.resolve("Matthew")}"></element-with-attrs>`;
  out = await consume(iter);
  assertStringIncludes(out, `<div>Matthew</div>`);
});

Deno.test('Renders a mix of HTML and custom element', async () => {
  let { html } = new Ocean({ document });
  class RandomElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let el = document.createElement('div');
      el.textContent = 'works';
      this.shadowRoot.append(el);
    }
  }
  customElements.define('html-wc-mix', RandomElement);
  let title = 'Homepage';
  let iter = html`<html><head><title>My page</title><body><h1>Page ${title}</h1><html-wc-mix></html-wc-mix><section id="after"><h1>${Promise.resolve('after')}</h1></section></body>`;
  let out = await consume(iter);

  assertStringIncludes(out, `<h1>Page Homepage</h1>`, 'page title rendered');
  assertStringIncludes(out, `<template shadowroot="open"><div>works</div></template>`, 'ce shadow rendered');
  assertStringIncludes(out, `<section id="after"><h1>after</h1></section>`, 'part after component rendered');
});

Deno.test('Renders boolean attributes', async () => {
  let { html } = new Ocean({ document });
  class BooleanElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let el = document.createElement('div');
      el.id = 'works';
      el.textContent = this.getAttribute('works') === '';
      this.shadowRoot.append(el);
    }
  }
  customElements.define('boolean-attr-el', BooleanElement);
  let iter = html`<div outer><boolean-attr-el works></boolean-attr-el></div>`;
  let out = await consume(iter);
  assertStringIncludes(out, `<div outer>`, 'outer boolean attribute');
  assertStringIncludes(out, `<boolean-attr-el works>`, 'rendered boolean with no value');
  assertStringIncludes(out, `<div id="works">true</div>`, 'shadow rendered');
});

Deno.test('Including a doctype works', async () => {
  let { html } = new Ocean({ document });
  let iter = html`
    <!doctype html>
    <html lang="en">
    <title>My page</title>
    <h1>My page</h1>
    <h2>User: ${Promise.resolve('Wilbur')}</h2>
  `;
  let out = await consume(iter);
  assertStringIncludes(out, `<!doctype html>`, 'Doctype is included');
  assertStringIncludes(out, `<h2>User: Wilbur</h2>`, 'Rendered promise content');
  assertNotMatch(out, /<\/html>/, 'No closing tag for html');
});

Deno.test('Props can be passed with dot syntax', async () => {
  let { html } = new Ocean({ document });
  class MyPropEl extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let name = this.name;
      let div = document.createElement('div');
      div.id = "name";
      div.textContent = name;
      this.shadowRoot.append(div);
    }
  }
  customElements.define('my-prop-el', MyPropEl);
  let iter = html`<my-prop-el .name="${'Wilbur'}" class="dark"></my-prop-el>`;
  let out = await consume(iter);

  assertStringIncludes(out, `<my-prop-el class="dark">`, 'Start tag no prop attr');
  assertStringIncludes(out, `<div id="name">Wilbur</div>`, 'Content from the prop');
});

Deno.test('Multiple props can be passed with dot syntax', async () => {
  let { html } = new Ocean({ document });
  class MyPropEl extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let name = this.name;
      let div = document.createElement('div');
      div.id = "name";
      div.textContent = name;
      this.shadowRoot.append(div);

      let city = this.city;
      let div2 = document.createElement('div');
      div2.id = 'city';
      div2.textContent = city;
      this.shadowRoot.append(div2);
    }
  }
  customElements.define('my-multiprop-el', MyPropEl);
  let iter = html`<my-multiprop-el .name="${'Wilbur'}" .city="${'London'}" class="dark"></my-multiprop-el>`;
  let out = await consume(iter);

  console.log(out);

  assertStringIncludes(out, `<my-multiprop-el class="dark">`, 'Start tag no prop attrs');
  assertStringIncludes(out, `<div id="name">Wilbur</div><div id="city">London</div>`, 'Content from the props');
});

Deno.test('Can render to HTML attributes', async () => {
  let { html } = new Ocean({ document });
  let url = 'http://example.com/something';
  let iter = html`<a href="${url}">Stuff</a><h1>${'title'}</h1>`;
  let out = await consume(iter);
  assertEquals(out, `<a href="http://example.com/something">Stuff</a><h1>title</h1>`);
});

Deno.test('Can render to HTML attributes with multiple insertion points', async () => {
  let { html } = new Ocean({ document });
  let iter = html`<a href="http://example.com/something&client_id=${1234}&client_secret=${'pizza'}&more">Stuff</a>`;
  let out = await consume(iter);
  assertEquals(out, `<a href="http://example.com/something&client_id=1234&client_secret=pizza&more">Stuff</a>`);
});

Deno.test('Can render to a title', async () => {
  let { html } = new Ocean({ document });
  let iter = html`<title>${'testing'}</title>`;
  let out = await consume(iter);
  assertEquals(out, `<title>testing</title>`);
});

Deno.test('Can render to a title with multiple insertions', async () => {
  let { html } = new Ocean({ document });
  let iter = html`<title>${'testing'} and ${'working'}</title>${'<h1>more</h1>'}`;
  let out = await consume(iter);
  assertEquals(out, `<title>testing and working</title><h1>more</h1>`);

  iter = html`<title>and ${'working'}</title>${'<h1>more</h1>'}`;
  out = await consume(iter);
  assertEquals(out, `<title>and working</title><h1>more</h1>`);

  iter = html`<title>${'testing'} and</title>${'<h1>more</h1>'}`;
  out = await consume(iter);
  assertEquals(out, `<title>testing and</title><h1>more</h1>`);
});

Deno.test('Can render nested HTML', async () => {
  let { html } = new Ocean({ document });
  let iter = html`<div><span>outer</span>${html`<span>inner</span>`}</div>`;
  let out = await consume(iter);
  assertEquals(out, `<div><span>outer</span><span>inner</span></div>`);
});

Deno.test('Text is serialized', async () => {
  let { html } = new Ocean({ document });
  customElements.define('my-text-el', class extends HTMLElement {
    connectedCallback() {
      let div = document.createElement('div');
      div.textContent = '<div>inner</div>';
      this.append(div);
    }
  });
  let iter = html`<my-text-el></my-text-el>`;
  let out = await consume(iter);
  assertEquals(out, `<my-text-el><div>&lt;div&gt;inner&lt;/div&gt;</div></my-text-el>`);
});

Deno.test('Text is not serialized inside of scripts', async () => {
  let { html } = new Ocean({ document });
  customElements.define('my-text-in-script-el', class extends HTMLElement {
    connectedCallback() {
      let el = document.createElement('script');
      el.textContent = 'html`<div>inner</div>`;';
      this.append(el);
    }
  });
  let iter = html`<my-text-in-script-el></my-text-in-script-el>`;
  let out = await consume(iter);
  assertEquals(out, '<my-text-in-script-el><script>html`<div>inner</div>`;</script></my-text-in-script-el>');
});

Deno.test('Text is not serialized inside of style tags', async () => {
  let { html } = new Ocean({ document });
  customElements.define('my-text-in-style-el', class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open'});
    }
    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>#test > div { color: red; }</style>
      `;
    }
  });
  let iter = html`<my-text-in-style-el></my-text-in-style-el>`;
  let out = await consume(iter);
  assertStringIncludes(out, '<style>#test > div { color: red; }</style>', 'no escaping in style tags');
});

Deno.test('Attribute values are escaped in HTML', async () => {
  let { html } = new Ocean({ document });
  let iter = html`<div a='"a'></div>`;
  let out = await consume(iter);
  assertEquals(out, `<div a="&quot;a"></div>`);
});

Deno.test('Attribute values are escaped in custom elements', async () => {
  let { html } = new Ocean({ document });
  class AttributeElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      let el = document.createElement('div');
      el.setAttribute('a', '"a');
      this.shadowRoot.append(el);
    }
  }
  customElements.define('attribute-el', AttributeElement);
  let iter = html`<div outer><attribute-el></attribute-el></div>`;
  let out = await consume(iter);
  assertStringIncludes(out, `<div a="&quot;a"></div>`, 'attribute values escaped');
});

Deno.test('Can take an array of HTML content', async () => {
  let { html } = new Ocean({ document });
  let iter = html`<ul>${[1, 2, 3].map(n => html`<li>${n}</li>`)}</ul>`;
  let out = await consume(iter);
  assertEquals(out, `<ul><li>1</li><li>2</li><li>3</li></ul>`);
});