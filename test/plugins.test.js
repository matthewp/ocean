import '../lib/shim.js';
import { Ocean } from '../lib/mod.js';
import { customElements, document, HTMLElement, consume, parse } from './helpers.js';
import { assert, assertEquals } from './deps.js';

Deno.test('Plugins can access each DOM element and mutate', async () => {
  class AddStuff {
    handle(el) {
      if(el.id === 'some-div') {
        let span = el.ownerDocument.createElement('span');
        span.textContent = 'works';
        el.append(span);
      }
    }
  }

  const { html } = new Ocean({
    document,
    plugins: [
      () => new AddStuff()
    ]
  });
  let iter = html`<div id="some-div"></div>`;
  let out = await consume(iter);
  console.log(out);
  let doc = parse(out);
  assert(doc.querySelector('span'), 'span was added.');
});