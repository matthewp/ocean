import '../../lib/shim.js?global';
import { LitElement, html as litHtml } from 'https://cdn.skypack.dev/lit@2.0.0-rc.2';
import { Ocean } from '../../lib/mod.js';
import { consume, document, customElements, parse } from '../helpers.js';
import { assertStringIncludes, assertEquals } from '../deps.js';

Deno.test('Can render a lit app', async () => {
  let { html } = new Ocean({ document });
  class MyElement extends LitElement {
    render() {
      return litHtml`
        <div id="testing">Hello world</div>
      `;
    }
  }
  customElements.define('my-lit-test', MyElement);

  let iter = html`
    <div id="outer">
      <my-lit-test></my-lit-test>
    </div>
  `;

  let out = await consume(iter);
  assertStringIncludes(out, '<div id="testing">Hello world</div>');
});

Deno.test('Can render lit-element attributes', async () => {
  let { html } = new Ocean({ document });
  class MyElement extends LitElement {
    render() {
      return litHtml`<div>testing</div>`;
    }
  }
  customElements.define('lit-element-attrs', MyElement);
  let iter = html`
    <div>
      <lit-element-attrs foo="bar" two="three"></lit-element-attrs>
    </div>
  `;
  let out = await consume(iter);
  let doc = parse(out);
  let el = doc.querySelector('lit-element-attrs');
  assertEquals(el.getAttribute('foo'), 'bar');
  assertEquals(el.getAttribute('two'), 'three');
});