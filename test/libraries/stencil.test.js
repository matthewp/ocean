import '../../lib/shim.js?global';
import { Ocean } from '../../lib/mod.js';
import { consume, document, parse } from '../helpers.js';
import { assert } from '../deps.js';

Deno.test({
  name: 'Stencil elements render',
  fn: async () => {
    await import('./stencil-el/stencil-el.esm.js');
    let { html } = new Ocean({ document });
    let iter = html`<stencil-el></stencil-el>`;
    let out = await consume(iter);
    let doc = parse(out);
    assert(doc.querySelector('stencil-el'));
    assert(doc.querySelector('stencil-el template div'));
  }
});