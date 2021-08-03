import '../../lib/shim.js?global';
import { define } from 'https://cdn.skypack.dev/uce@1.16.4';
import { Ocean } from '../../lib/mod.js';
import { consume, document } from '../helpers.js';
import { assertStringIncludes } from '../deps.js';

Deno.test({
  name: 'uce elements render',
  fn: async () => {
    let { html } = new Ocean({ document });

    define('uce-el', {
      attachShadow: { mode: 'open' },
      render() {
        return this.html`
          <div>testing</div>
        `;
      }
    });
  
    let iter = html`<uce-el></uce-el>`;
    let out = await consume(iter);
    console.log(out);
    assertStringIncludes(out, '<div>testing</div>');
  }
});