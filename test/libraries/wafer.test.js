//v9.0.3

import '../../lib/shim.js?global';
import Wafer from 'https://cdn.skypack.dev/@lamplightdev/wafer@1.0.4';
import { Ocean } from '../../lib/mod.js';
import { consume, document, parse } from '../helpers.js';
import { assert, assertEquals, assertStringIncludes } from '../deps.js';

Deno.test({
  name: 'uce elements render',
  fn: async () => {
    let { html } = new Ocean({ document });

    class MyElement extends Wafer {
      static get template() {
        return `
          <span id="count"></span>
          <button id="dec">-</button>
          <button id="inc">+</button>
        `;
      }

      static get props() {
        return {
          count: {
            type: Number,
            reflect: true,
            initial: 10,
            targets: [
              {
                // this will target all elements matching #count in the template
                // in this case the <span id="count"></span> element
                // ($ indicates matched in the Shadow DOM)
                selector: "$#count",

                // this will update the `textContent` of the matching element(s)
                // to the value of `count`
                text: true,

                // this will set a `total` property on the matching element(s)
                // to the value of `count`
                property: "total",

                // this will set a `total` attribute on the matching element(s)
                // to the value of `count`
                attribute: "total",
              },
            ],
          },
        };
      }
    }
    customElements.define('wafer-el', MyElement);
  
    let iter = html`<wafer-el count="5"></wafer-el>`;
    let out = await consume(iter);
    let doc = parse(out);
    let el = doc.querySelector('wafer-el');
    assert(el);

    let tmpl = el.querySelector('template').content;
    let cnt = tmpl.querySelector('#count');
    assertEquals(cnt.textContent, '5');
  }
});