import '../../lib/shim.js?global';
import register from 'https://cdn.skypack.dev/preact-custom-element@4.2.1';
import { Component, html as htm } from 'https://cdn.skypack.dev/htm@3.1.0/preact';
import { Ocean } from '../../lib/mod.js';
import { consume, document } from '../helpers.js';
import { assertStringIncludes } from '../deps.js';

Deno.test('preact elements render', async () => {
  let { html } = new Ocean({ document });
  class MyComponent extends Component {
    render({ name }) {
      return htm`<span>Hello ${name}</span>`;
    }
  }

  register(MyComponent, 'preact-component', ['name'], { shadow: true });

  let iter = html`<preact-component name="World"></preact-component>`;
  let out = await consume(iter);
  assertStringIncludes(out, '<span>Hello World</span>');
});