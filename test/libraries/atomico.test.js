import '../../lib/shim.js?global';
import { c, html as ahtml } from 'https://cdn.skypack.dev/atomico@1.27.0';
import { Ocean } from '../../lib/mod.js';
import { consume, document, customElements, parse } from '../helpers.js';
import { assert, assertEquals } from '../deps.js';

Deno.test({
  name: 'Atomico elements render',
  ignore: false,
  fn: async () => {
    function component() {
      return ahtml`
        <host shadowDom>
          <h1>Testing</h1>
        </host>
      `;
    }
    component.props = {};
    customElements.define('atomico-el', c(component));
  
    let { html } = new Ocean({ document });
    let iter = html`<atomico-el></atomico-el>`;
    let out = await consume(iter);
    let doc = parse(out);
    let cel = doc.querySelector('atomico-el');
    assert(cel);

    assert(cel.querySelector('template h1'));
    assertEquals(cel.querySelector('template h1').textContent, 'Testing');
  }
});