

import '../../lib/shim.js?global';
import { html as litHtml } from 'https://cdn.skypack.dev/lit-html@1.4.1'
import { component } from 'https://cdn.skypack.dev/haunted@4.8.2';
import { Ocean } from '../../lib/mod.js';
import { consume, customElements } from '../helpers.js';
import { assertStringIncludes } from '../deps.js';

Deno.test('Works with Haunted elements', async () => {
  let { html } = new Ocean({ document });
  function App() {
    return litHtml`
      <div>testing</div>
    `;
  }
  const AppElement = component(App);
  customElements.define('haunted-app', AppElement);

  let iter = html`<haunted-app></haunted-app>`;
  let out = await consume(iter);
  assertStringIncludes(out, `<div>testing</div>`, 'Rendered the shadow content');
});