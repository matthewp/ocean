import '../../lib/shim.js?global';
import './stencil-el/stencil-el.esm.js';
import { Ocean } from '../../lib/mod.js';
import { consume, document } from '../helpers.js';
import { assertStringIncludes } from '../deps.js';

Deno.test({
  name: 'Stencil elements render',
  fn: async () => {
    let { html } = new Ocean({ document });
    let iter = html`<stencil-el></stencil-el>`;
    let out = await consume(iter);
    console.log(out);
  }
});